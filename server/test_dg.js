const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');
require('dotenv').config({ path: './.env' });

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const live = deepgram.listen.live({
  model: 'nova-3',
  language: 'en',
  smart_format: true,
  punctuate: true,
  interim_results: true,
  encoding: 'linear16',
  sample_rate: 16000
});

live.on(LiveTranscriptionEvents.Open, () => {
  console.log('OPEN');
  const emptyAudio = Buffer.alloc(32000);
  live.send(emptyAudio);
});

live.on(LiveTranscriptionEvents.Transcript, (data) => {
  console.log('RESULTS', JSON.stringify(data));
});

live.on(LiveTranscriptionEvents.Error, (e) => console.log('ERR', e));

setTimeout(() => {
  console.log('Timeout');
  process.exit(0);
}, 5000);
