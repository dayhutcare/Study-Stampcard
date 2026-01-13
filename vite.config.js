import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',  // Replace 'your-repo-name' with your actual GitHub repo name
})
```

**Step 2: Create GitHub Actions Workflow**

Create this folder structure in your repo:
```
.github/
  workflows/
    deploy.yml
