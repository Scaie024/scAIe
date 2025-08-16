import { queryGemini } from './lib/gemini-client';

async function testFallback() {
  try {
    const result = await queryGemini('Hello, how are you?');
    console.log('Success! Response:', result);
  } catch (error) {
    console.error('All AI services failed:', error.message);
  }
}

testFallback();
