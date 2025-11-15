export const getExtractionStatusMessage = (stage: string, fileIndex: number, totalFiles: number, fileName: string): string => {
  const messages = {
    'converting': `📄 Converting ${fileName} (${fileIndex + 1}/${totalFiles})`,
    'analyzing': `🔍 Analyzing components in ${fileName}...`,
    'cv_analysis': `🤖 Running computer vision analysis...`,
    'ai_analysis': `🧠 Running AI component detection...`,
    'combining': `⚡ Combining and optimizing results...`,
    'cropping': `✂️ Extracting ${fileName} components...`,
    'finalizing': `✨ Finalizing ${fileName} components...`,
    'complete': `✅ ${fileName} complete!`
  };
  
  return messages[stage] || `Processing ${fileName}...`;
};

export const calculateExtractionProgress = (stage: string): number => {
  const stageProgress = {
    'converting': 15,
    'analyzing': 25,
    'cv_analysis': 40,
    'ai_analysis': 60,
    'combining': 75,
    'cropping': 85,
    'finalizing': 95,
    'complete': 100
  };
  
  return stageProgress[stage] || 0;
};

export const getComponentTypeEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    'Text Block': '📝',
    'Product Image (Packshot)': '📸',
    'Brand Logo': '🏷️',
    'Chart/Graph': '📊',
    'Data Table': '📋',
    'Key Feature Icon': '⭐',
    'Header/Footer Element': '📄',
    'Regulatory Text Block': '⚖️',
    'Call-to-Action Button': '🔘',
    'Background Element': '🎨',
    'Other Element': '🔧'
  };
  
  return emojiMap[category] || '📦';
};

export const formatComponentStats = (components: any[]): string => {
  const categoryCount = components.reduce((acc, comp) => {
    acc[comp.category] = (acc[comp.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const stats = Object.entries(categoryCount)
    .map(([category, count]) => `${getComponentTypeEmoji(category)} ${count}`)
    .join(' • ');
    
  return stats || 'No components';
};