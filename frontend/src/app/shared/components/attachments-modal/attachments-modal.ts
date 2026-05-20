import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Attachment {
  originalName: string;
  fileName: string;
  url: string;
  size: number;
  type: string;
  progress?: number;
  status: 'uploading' | 'completed' | 'error';
}

@Component({
  selector: 'app-attachments-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attachments-modal.component.html',
  styleUrl: './attachments-modal.component.scss',
})
export class AttachmentsModal {
  @Input() isAttachmentsModalOpen: boolean = false;
  @Input() isEditMode: boolean = false;
  
  // Binding for the attachments
  @Input() attachments: Attachment[] = [];
  @Output() attachmentsChange = new EventEmitter<Attachment[]>();
  
  @Output() closeModal = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Allowed file types
  allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  isDragging = false;
  
  // List of files currently being uploaded or already uploaded in this session
  uploadList: Attachment[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.attachments && this.attachments.length > 0) {
      this.uploadList = [...this.attachments.map(a => ({...a, status: 'completed' as const}))];
    }
  }

  ngOnChanges() {
    if (this.attachments) {
      this.uploadList = [...this.attachments.map(a => ({...a, status: 'completed' as const}))];
    }
  }

  closeAttachmentsModal(): void {
    this.closeModal.emit();
  }

  onSave(): void {
    const completedAttachments = this.uploadList.filter(a => a.status === 'completed');
    this.attachmentsChange.emit(completedAttachments);
    this.closeAttachmentsModal();
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
    this.fileInput.nativeElement.value = ''; // Reset input
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  handleFiles(files: FileList): void {
    Array.from(files).forEach(file => {
      if (!this.allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not allowed. Please upload images, PDF, Word, or PowerPoint files.`);
        return;
      }
      
      const attachment: Attachment = {
        originalName: file.name,
        fileName: '', // Will be set by backend
        url: '', // Will be set by backend
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'uploading'
      };
      
      this.uploadList.push(attachment);
      this.uploadFile(file, attachment);
    });
    this.cdr.detectChanges();
  }

  uploadFile(file: File, attachment: Attachment): void {
    const formData = new FormData();
    formData.append('files', file);

    this.http.post<any>(`${environment.apiUrl}/attachments/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          attachment.progress = Math.round(100 * event.loaded / event.total);
          this.cdr.detectChanges();
        } else if (event.type === HttpEventType.Response) {
          attachment.progress = 100;
          attachment.status = 'completed';
          
          if (event.body && event.body.attachments && event.body.attachments.length > 0) {
            const uploadedFile = event.body.attachments[0];
            attachment.fileName = uploadedFile.fileName;
            attachment.url = uploadedFile.url;
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Upload error', err);
        attachment.status = 'error';
        alert(`Failed to upload ${file.name}`);
        this.cdr.detectChanges();
      }
    });
  }

  removeAttachment(attachment: Attachment, index: number): void {
    if (attachment.status === 'uploading') {
      // It's uploading, just remove it from UI (cancel upload isn't trivially supported without subscription)
      this.uploadList.splice(index, 1);
      this.cdr.detectChanges();
      return;
    }

    if (attachment.fileName) {
      this.http.delete(`${environment.apiUrl}/attachments/remove`, {
        body: { fileName: attachment.fileName }
      }).subscribe({
        next: () => {
          this.uploadList.splice(index, 1);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to delete file on server', err);
          // Remove it from UI anyway
          this.uploadList.splice(index, 1);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.uploadList.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  getFileBadgeClass(type: string): string {
    if (type.includes('pdf')) return 'pdf-icon';
    if (type.includes('word')) return 'doc-icon';
    if (type.includes('presentation')) return 'ppt-icon';
    if (type.includes('image')) {
      if (type.includes('png')) return 'png-icon';
      if (type.includes('jpeg')) return 'jpeg-icon';
      return 'png-icon'; // fallback image
    }
    return 'doc-icon'; // default
  }

  getFileBadgeText(type: string): string {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word')) return 'DOC';
    if (type.includes('presentation')) return 'PPT';
    if (type.includes('png')) return 'PNG';
    if (type.includes('jpeg')) return 'JPEG';
    if (type.includes('image')) return 'IMG';
    return 'FILE';
  }
}
