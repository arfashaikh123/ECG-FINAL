import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import './FileUpload.css';

export default function FileUpload({ onFileSelect, isLoading }) {
    const [error, setError] = useState(null);

    const onDrop = useCallback(
        (acceptedFiles, rejectedFiles) => {
            setError(null);
            if (rejectedFiles.length > 0) {
                setError('Please upload a valid CSV file');
                return;
            }
            if (acceptedFiles.length > 0) {
                onFileSelect(acceptedFiles[0]);
            }
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg']
        },
        maxFiles: 1,
        disabled: isLoading,
    });

    const isImage = acceptedFiles.length > 0 && acceptedFiles[0].type.startsWith('image/');

    return (
        <div className="file-upload-wrapper">
            <div
                {...getRootProps()}
                className={`dropzone glass-card ${isDragActive ? 'dropzone-active' : ''} ${isLoading ? 'dropzone-disabled' : ''}`}
            >
                <input {...getInputProps()} id="ecg-file-input" />

                <div className="dropzone-content">
                    {acceptedFiles.length > 0 ? (
                        <>
                            <div className={`dropzone-icon ${isImage ? 'dropzone-icon-image' : 'dropzone-icon-success'}`}>
                                {isImage ? <FileSpreadsheet size={36} /> : <FileSpreadsheet size={36} />}
                            </div>
                            <p className="dropzone-filename">{acceptedFiles[0].name}</p>
                            <p className="dropzone-hint">
                                {(acceptedFiles[0].size / 1024).toFixed(1)} KB • Click or drag to replace
                            </p>
                        </>
                    ) : (
                        <>
                            <div className={`dropzone-icon ${isDragActive ? 'dropzone-icon-active' : ''}`}>
                                <Upload size={36} />
                            </div>
                            <p className="dropzone-text">
                                {isDragActive ? 'Drop your file here...' : 'Upload ECG (CSV or Image)'}
                            </p>
                            <p className="dropzone-hint">
                                Supports .csv, .png, .jpg
                            </p>
                        </>
                    )}
                </div>

                {/* Animated border */}
                <div className="dropzone-border" />
            </div>

            {error && (
                <div className="upload-error">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
        </div>
    );
}
