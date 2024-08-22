import { VertexAI } from '@google-cloud/vertexai';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

// Set the path to your service account key file
process.env.GOOGLE_APPLICATION_CREDENTIALS ;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form:', err);
      res.status(500).json({ error: 'Failed to parse the form' });
      return;
    }

    console.log('Parsed fields:', fields);
    console.log('Parsed files:', files);

    const videoFile = files.file?.[0];
    const videoUrl = fields.url?.[0];  // Note: formidable returns an array for fields

    if (!videoFile && !videoUrl) {
      console.error('No video file or URL provided');
      res.status(400).json({ error: 'Please provide a video file or URL' });
      return;
    }

    try {
      const vertexAI = new VertexAI({
        project: process.env.GOOGLE_CLOUD_PROJECT,
        location: 'us-central1',
      });

      const generativeVisionModel = vertexAI.getGenerativeModel({
        model: 'gemini-1.5-flash-001',
      });

      let request;
      if (videoFile) {
        console.log('Processing video file:', videoFile.originalFilename);
        const fileData = fs.readFileSync(videoFile.filepath);
        request = {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: fileData.toString('base64'),
                    mimeType: videoFile.mimetype,
                  },
                },
                { text: 'What is in this video, write captions for this video?' },
              ],
            },
          ],
        };
      } else if (videoUrl) {
        console.log('Processing video URL:', videoUrl);
        if (!videoUrl.startsWith('http')) {
          throw new Error(`Invalid video URL provided: ${videoUrl}`);
        }
        request = {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  fileData: {
                    fileUri: videoUrl,
                    mimeType: 'video/mp4',
                  },
                },
                { text: 'What is in this video?' },
              ],
            },
          ],
        };
      } else {
        throw new Error('No video file or valid URL provided');
      }

      console.log('Sending request to Vertex AI:', JSON.stringify(request, null, 2));

      const response = await generativeVisionModel.generateContent(request);
      const aggregatedResponse = await response.response;
      const caption = aggregatedResponse.candidates[0].content.parts[0].text;

      console.log('Generated caption:', caption);

      res.status(200).json({ caption });
    } catch (error) {
      console.error('Error in generating caption:', error);
      res.status(500).json({ error: 'Failed to generate caption: ' + error.message });
    }
  });
}