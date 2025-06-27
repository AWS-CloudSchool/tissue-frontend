import axios from 'axios';

export const askBedrockChatbot = async (question, s3Key) => {
  const response = await axios.post('/bedrock/chat', { question, s3_key: s3Key });
  return response.data;
};

export const getChatHistory = async () => {
  const response = await axios.get('/bedrock/chat-history');
  return response.data;
};

export const clearChatHistory = async () => {
  const response = await axios.delete('/bedrock/chat-history');
  return response.data;
}; 