export interface FileSystemItem {
  name: string;
  type: 'file' | 'folder';
  contentType?: string;
  path?: string;
  children?: FileSystemItem[];
}

const getMimeType = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'pdf':
      return 'application/pdf';
    case 'mp3':
      return 'audio/mpeg';
    case 'mp4':
      return 'video/mp4';
    default:
      return 'application/octet-stream';
  }
};

const shouldShowFile = (filename: string): boolean => {
  // List of files to hide
  const hiddenFiles = [
    'directory.json',
    '.DS_Store', // Also hide macOS system files
    'Thumbs.db'  // And Windows system files
  ];
  
  return !hiddenFiles.includes(filename);
};

let subscribers: (() => void)[] = [];

export const subscribe = (callback: () => void) => {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter(cb => cb !== callback);
  };
};

export const scanPublicFiles = async () => {
  try {
    console.log('Fetching directory.json...');
    const response = await fetch('/files/directory.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const files = await response.json();
    console.log('Received files:', files);
    updateFileSystem(files);
    subscribers.forEach(callback => callback());
  } catch (error) {
    console.error('Error scanning files:', error);
    throw error;
  }
};

export const fileSystemData: FileSystemItem = {
  name: 'root',
  type: 'folder',
  children: [
    {
      name: 'Desktop',
      type: 'folder',
      children: []
    },
    {
      name: 'Documents',
      type: 'folder',
      children: [
        {
          name: 'resume.pdf',
          type: 'file',
          contentType: 'application/pdf',
          path: '/files/Documents/resume.pdf'
        }
      ]
    },
    {
      name: 'Downloads',
      type: 'folder',
      children: []
    },
    {
      name: 'Music',
      type: 'folder',
      children: []
    },
    {
      name: 'Pictures',
      type: 'folder',
      children: [
        {
          name: 'vacation',
          type: 'folder',
          children: [
            {
              name: 'beach.jpg',
              type: 'file',
              contentType: 'image/jpeg',
              path: '/files/Pictures/vacation/beach.jpg'
            },
            {
              name: 'sunset.jpg',
              type: 'file',
              contentType: 'image/jpeg',
              path: '/files/Pictures/vacation/sunset.jpg'
            }
          ]
        }
      ]
    },
    {
      name: 'Videos',
      type: 'folder',
      children: []
    }
  ]
};

const updateFileSystem = (files: string[]) => {
  // Clear existing children from all folders
  fileSystemData.children = fileSystemData.children?.map(item => ({
    ...item,
    children: []
  }));

  // Process each file path
  files.forEach(filePath => {
    const parts = filePath.split('/').filter(p => p);
    if (parts[0] !== 'files') return;
    
    // Skip hidden files
    const filename = parts[parts.length - 1];
    if (!shouldShowFile(filename)) return;
    
    parts.shift(); // Remove 'files' from parts
    
    let current = fileSystemData;
    let currentPath = [];
    
    // Process each part of the path
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath.push(part);
      
      // Find or create the current folder in fileSystemData
      if (!current.children) current.children = [];
      
      if (i === parts.length - 1) {
        // It's a file
        current.children.push({
          name: part,
          type: 'file',
          contentType: getMimeType(part),
          path: filePath
        });
      } else {
        // It's a folder
        let folder = current.children.find(item => item.name === part);
        if (!folder) {
          folder = {
            name: part,
            type: 'folder',
            children: []
          };
          current.children.push(folder);
        }
        current = folder;
      }
    }
  });

  // Sort children alphabetically, folders first
  const sortChildren = (items: FileSystemItem[]) => {
    items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
    
    // Recursively sort children
    items.forEach(item => {
      if (item.children) {
        sortChildren(item.children);
      }
    });
  };

  if (fileSystemData.children) {
    sortChildren(fileSystemData.children);
  }

  console.log('Updated file system:', JSON.stringify(fileSystemData, null, 2));
};

export const getItemAtPath = (path: string[]): FileSystemItem | null => {
  let current = fileSystemData;
  
  if (path.length === 0) return current;
  
  for (const segment of path) {
    if (current.children) {
      const found = current.children.find(item => item.name === segment);
      if (found) {
        current = found;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  
  return current;
};
