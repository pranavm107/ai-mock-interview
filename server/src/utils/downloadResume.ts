export const downloadResume = async (fileUrl: string): Promise<Buffer> => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error downloading resume:', error);
    throw new Error('Failed to download PDF from storage');
  }
};
