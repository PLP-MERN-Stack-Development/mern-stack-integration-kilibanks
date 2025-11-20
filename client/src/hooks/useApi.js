import { postService, categoryService } from '../services/api'

export default function useApi() {
  return { postService, categoryService }
}
