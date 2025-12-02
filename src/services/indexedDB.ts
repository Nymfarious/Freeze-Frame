import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Project, Frame } from '@/types';

interface FramePerfectDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { 'by-date': number };
  };
  frames: {
    key: string;
    value: Frame;
    indexes: { 'by-project': string; 'by-timestamp': number };
  };
}

const DB_NAME = 'frameperfect-ai';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<FramePerfectDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<FramePerfectDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<FramePerfectDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Projects store
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('by-date', 'lastModified');
      }

      // Frames store
      if (!db.objectStoreNames.contains('frames')) {
        const frameStore = db.createObjectStore('frames', { keyPath: 'id' });
        frameStore.createIndex('by-project', 'projectId');
        frameStore.createIndex('by-timestamp', 'timestamp');
      }
    },
  });

  return dbInstance;
}

// Project operations
export async function saveProject(project: Project): Promise<void> {
  const db = await getDB();
  await db.put('projects', project);
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await getDB();
  return db.get('projects', id);
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDB();
  return db.getAllFromIndex('projects', 'by-date');
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('projects', id);
  
  // Delete all frames for this project
  const frames = await getFramesByProject(id);
  const tx = db.transaction('frames', 'readwrite');
  await Promise.all(frames.map(frame => tx.store.delete(frame.id)));
  await tx.done;
}

// Frame operations
export async function saveFrame(frame: Frame): Promise<void> {
  const db = await getDB();
  await db.put('frames', frame);
}

export async function saveFrames(frames: Frame[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('frames', 'readwrite');
  await Promise.all(frames.map(frame => tx.store.put(frame)));
  await tx.done;
}

export async function getFrame(id: string): Promise<Frame | undefined> {
  const db = await getDB();
  return db.get('frames', id);
}

export async function getFramesByProject(projectId: string): Promise<Frame[]> {
  const db = await getDB();
  return db.getAllFromIndex('frames', 'by-project', projectId);
}

export async function getAllKeeperFrames(): Promise<Frame[]> {
  const db = await getDB();
  const allFrames = await db.getAll('frames');
  return allFrames.filter(frame => frame.isKeeper);
}

export async function getKeeperFramesByProject(projectId: string): Promise<Frame[]> {
  const db = await getDB();
  const projectFrames = await db.getAllFromIndex('frames', 'by-project', projectId);
  return projectFrames.filter(frame => frame.isKeeper);
}

export async function deleteFrame(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('frames', id);
}

export async function updateFrame(id: string, updates: Partial<Frame>): Promise<void> {
  const db = await getDB();
  const frame = await db.get('frames', id);
  if (frame) {
    await db.put('frames', { ...frame, ...updates });
  }
}
