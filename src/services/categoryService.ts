import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from './seedService';

export async function getCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const fetchPromise = getDocs(q);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));

    const snap: any = await Promise.race([fetchPromise, timeoutPromise]);
    if (snap) {
      const categories: Category[] = [];
      snap.forEach((d: any) => {
        categories.push(d.data() as Category);
      });

      if (categories.length > 0) {
        return categories;
      }
    }
  } catch (err: any) {
    console.warn('Note getting categories in offline mode, using defaults:', err?.message || err);
  }

  // Fallback to DEFAULT_CATEGORIES if empty or offline
  return DEFAULT_CATEGORIES.map((c) => ({
    categoryId: c.id,
    name: c.name,
    icon: c.icon,
    description: c.description,
    order: c.order,
    createdAt: new Date().toISOString()
  }));
}

export async function createCategory(name: string, description: string, icon: string): Promise<Category> {
  const categories = await getCategories();
  const maxOrder = categories.reduce((max, c) => Math.max(max, c.order || 0), 0);
  const categoryId = `cat-${Date.now()}`;

  const newCat: Category = {
    categoryId,
    name,
    description,
    icon: icon || 'Folder',
    order: maxOrder + 1,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'categories', categoryId), newCat);
  } catch (err) {
    console.warn('Category saved locally:', err);
  }
  return newCat;
}

export async function updateCategory(categoryId: string, name: string, description: string, icon: string): Promise<void> {
  try {
    const catRef = doc(db, 'categories', categoryId);
    await updateDoc(catRef, {
      name,
      description,
      icon
    });
  } catch (err) {
    console.warn('Category update saved locally:', err);
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (err) {
    console.warn('Category deletion saved locally:', err);
  }
}
