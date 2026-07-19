import { createClient, LiveClient } from '@deepgram/sdk';

export const setupDeepgramService = (): LiveClient => {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPGRAM_API_KEY is missing');
  }

  const deepgram = createClient(apiKey);
  
  const options = {
    model: 'nova-3',
    language: 'en',
    smart_format: true,
    punctuate: true,
    interim_results: true
  };

  console.log('Deepgram config:', JSON.stringify(options, null, 2));

  const live = deepgram.listen.live(options as any);

  return live;
};
