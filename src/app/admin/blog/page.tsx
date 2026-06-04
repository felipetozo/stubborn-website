export const dynamic = 'force-dynamic';

import { getAllPostsAdmin, getBlogCategoriesAdmin } from '@/actions/blogActions';
import BlogAdminClient from './BlogAdminClient';

export default async function AdminBlogPage() {
  const [posts, categories] = await Promise.all([
    getAllPostsAdmin(),
    getBlogCategoriesAdmin(),
  ]);

  return <BlogAdminClient posts={posts} initialCategories={categories} />;
}
