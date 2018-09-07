import AWS from 'aws-sdk/dist/aws-sdk-react-native';

export const sendAudioToLex = async (audioData) => {
  const lexRuntime = new AWS.LexRuntime();

  const audioBuffer = Buffer.from(audioData.base64, 'base64');
  if (!audioBuffer) {
    throw new Error('Could not interpret speech input');
  }

  const params = {
    botAlias: '$LATEST',
    botName: 'LibraLexBot',
    contentType: 'audio/lpcm; sample-rate=8000; sample-size-bits=16; channel-count=1; is-big-endian=false',
    inputStream: audioBuffer,
    userId: `LibraLexBot${Date.now()}`,
    accept: 'text/plain; charset=utf-8',
  };

  return lexRuntime.postContent(params).promise();
};

export default {
  sendAudioToLex,
};
