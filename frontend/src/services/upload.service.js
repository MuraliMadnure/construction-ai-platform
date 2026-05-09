import api from './api';

class UploadService {
  async uploadFile(file, folder = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    return response.data;
  }

  async uploadMultiple(files, folder = 'general') {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('folder', folder);

    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async deleteFile(fileId) {
    const response = await api.delete(`/upload/${fileId}`);
    return response.data;
  }

  getFileUrl(filePath) {
    return `${api.defaults.baseURL.replace('/api/v1', '')}/uploads/${filePath}`;
  }
}

export default new UploadService();
