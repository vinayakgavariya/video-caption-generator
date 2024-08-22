import React, { useState } from 'react';

const CaptionGenerator = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
    setCaption('');
    setError('');
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    setCaption('');
    setError('');
  };

  const generateCaption = async () => {
    if (!videoFile && !videoUrl) {
      setError('Please upload a video file or provide a video URL.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    if (videoFile) {
      formData.append('file', videoFile);
    } else {
      formData.append('url', videoUrl);
    }

    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCaption(data.caption);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate caption.');
      }
    } catch (err) {
      setError('An error occurred while processing the video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Caption Video</h1>

        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center bg-gray-50 mb-4 hover:border-blue-500">
          <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.88 6.12a1.5 1.5 0 00-2.12 0L11 9.88V6a1.5 1.5 0 00-3 0v7a1.5 1.5 0 003 0V10l3.88 3.88a1.5 1.5 0 002.12-2.12l-4.88-4.88a1.5 1.5 0 00-2.12 0L5 10.88V6a1.5 1.5 0 00-3 0v8.5A2.5 2.5 0 004.5 17h11a2.5 2.5 0 002.5-2.5V6a1.5 1.5 0 00-1.12-1.88z" />
              </svg>
              <span className="text-gray-500">Upload Video (MP4, WMV, etc.)</span>
              <span className="text-gray-400 text-sm">(Drag the file here to upload it)</span>
            </div>
          </label>
        </div>

        <div className="mb-4">
          <label htmlFor="video-url" className="block font-bold mb-2">
            or provide a video URL:
          </label>
          <input
            type="text"
            id="video-url"
            value={videoUrl}
            onChange={handleUrlChange}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            placeholder="Enter video URL"
          />
        </div>

        {(videoFile || videoUrl) && (
          <div className="bg-gray-100 p-3 rounded-lg mb-4 flex items-center justify-between">
            {videoFile ? (
              <span className="text-gray-700">{videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            ) : (
              <span className="text-gray-700">{videoUrl}</span>
            )}
          </div>
        )}

        <button
          className="w-full bg-green-500 text-white font-bold py-2 rounded-lg mb-4 hover:bg-green-600 disabled:opacity-50"
          onClick={generateCaption}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>

        {error && (
          <div className="bg-red-100 p-4 rounded-lg text-red-500 text-center">
            {error}
          </div>
        )}

        <div className="bg-blue-100 p-4 rounded-lg text-blue-500 text-center min-h-[100px]">
          {caption || (loading ? 'Generating caption, please wait...' : 'Auto-generated caption will appear here.')}
        </div>
      </div>
    </div>
  );
};

export default CaptionGenerator;