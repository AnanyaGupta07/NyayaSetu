# Delete Paper Feature Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users to delete uploaded papers from the /papers page via a 3-dot menu with confirmation dialog.

**Architecture:** Add a dropdown menu component to each paper card with a delete option. Clicking delete opens a confirmation modal. On confirmation, call backend API to delete the record from Supabase, then remove from frontend UI. Backend validates user ownership before deletion.

**Tech Stack:** React (Frontend), Python/Flask (Backend), Supabase (Database), Tailwind CSS (Styling)

---

## File Structure

**Files to create:**
- `frontend/src/components/DeletePaperDialog.jsx` - Reusable confirmation dialog component
- `frontend/src/components/PaperMenuDropdown.jsx` - Menu dropdown for paper actions

**Files to modify:**
- `frontend/src/lib/api.js` - Add deleteUserHistory API function
- `frontend/src/pages/Papers/MyPapers.jsx` - Integrate menu and dialog into paper cards
- `backend/main.py` - Add DELETE endpoint

---

## Chunk 1: Backend API Endpoint

### Task 1: Create DELETE endpoint in backend

**Files:**
- Modify: `backend/main.py`

- [ ] **Step 1: Review existing main.py structure**

Examine current Flask routes and understand the authentication pattern used.

Run: `cat backend/main.py | grep -A 5 "@app.route"`

Look for patterns like how user_id is extracted from requests.

- [ ] **Step 2: Add DELETE endpoint for history record**

Add this endpoint to `backend/main.py` (find the section with other @app.route decorators):

```python
@app.route('/api/history/<history_id>', methods=['DELETE'])
def delete_history(history_id):
    """Delete a user's analysis history record"""
    try:
        # Get user from token
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Unauthorized'}), 401
        
        token = auth_header.split(' ')[1] if ' ' in auth_header else None
        if not token:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Verify token and get user
        user = supabase.auth.get_user(token)
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
        
        user_id = user.user.id
        
        # Verify ownership before deletion
        response = supabase.table('history').select('user_id').eq('id', history_id).single().execute()
        
        if not response.data or response.data['user_id'] != user_id:
            return jsonify({'error': 'Forbidden'}), 403
        
        # Delete the record
        supabase.table('history').delete().eq('id', history_id).execute()
        
        return jsonify({'success': True, 'message': 'Paper deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting history: {e}")
        return jsonify({'error': str(e)}), 500
```

- [ ] **Step 3: Test endpoint manually with curl**

Run from backend directory:
```bash
curl -X DELETE http://localhost:5000/api/history/test-id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Expected: Should return either 403 (Forbidden - not user's paper) or 200 (deleted successfully) or 401 (no token)

- [ ] **Step 4: Commit backend changes**

```bash
cd backend
git add main.py
git commit -m "feat: add DELETE endpoint for history records with ownership validation"
```

---

## Chunk 2: Frontend API Function

### Task 2: Add deleteUserHistory function to API utilities

**Files:**
- Modify: `frontend/src/lib/api.js`

- [ ] **Step 1: Review existing API patterns in api.js**

Run: `cat src/lib/api.js`

Look for how other functions handle requests, authentication headers, and error handling.

- [ ] **Step 2: Add deleteUserHistory function**

Add to `frontend/src/lib/api.js` at the end of the file:

```javascript
export async function deleteUserHistory(historyId) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/history/${historyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete paper');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete history error:', error);
    throw error;
  }
}
```

- [ ] **Step 3: Test the function exists**

In frontend terminal, run:
```bash
cd frontend
grep -n "deleteUserHistory" src/lib/api.js
```

Expected: Function definition should show up with line number

- [ ] **Step 4: Commit frontend API function**

```bash
git add src/lib/api.js
git commit -m "feat: add deleteUserHistory API function"
```

---

## Chunk 3: Frontend UI Components

### Task 3: Create DeletePaperDialog component

**Files:**
- Create: `frontend/src/components/DeletePaperDialog.jsx`

- [ ] **Step 1: Create the confirmation dialog component**

Create new file `frontend/src/components/DeletePaperDialog.jsx`:

```jsx
import { useState } from 'react';
import { deleteUserHistory } from '@/lib/api';

export default function DeletePaperDialog({ isOpen, paperName, paperId, onConfirm, onCancel }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteUserHistory(paperId);
      onConfirm(paperId);
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0D1117] rounded-lg p-6 max-w-sm w-full mx-4 border border-white/10">
        <h3 className="text-lg font-headline text-slate-200 mb-2">Delete Paper?</h3>
        <p className="text-sm text-slate-400 mb-4">
          You're about to delete <span className="font-semibold">{paperName}</span>. This action cannot be undone.
        </p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-3 mb-4">
            <p className="text-red-400 text-xs font-label">{error}</p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-50 font-label text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 font-label text-sm transition-colors flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">hourglass_top</span>
                Deleting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">delete</span>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify component syntax**

Run from frontend:
```bash
cd frontend && npm run build 2>&1 | grep -i "deletepaperdialog"
```

Expected: No errors related to DeletePaperDialog

- [ ] **Step 3: Commit DeletePaperDialog component**

```bash
git add src/components/DeletePaperDialog.jsx
git commit -m "feat: add DeletePaperDialog confirmation component"
```

---

### Task 4: Create PaperMenuDropdown component

**Files:**
- Create: `frontend/src/components/PaperMenuDropdown.jsx`

- [ ] **Step 1: Create the dropdown menu component**

Create new file `frontend/src/components/PaperMenuDropdown.jsx`:

```jsx
import { useState, useRef, useEffect } from 'react';

export default function PaperMenuDropdown({ onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
      >
        <span className="material-symbols-outlined text-[18px]">more_vert</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-[#1a1e28] rounded-lg border border-white/10 shadow-lg z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 font-label rounded-lg first:rounded-t-lg"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Delete Paper
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify component syntax**

Run from frontend:
```bash
cd frontend && npm run build 2>&1 | grep -i "papermenudropdown"
```

Expected: No errors related to PaperMenuDropdown

- [ ] **Step 3: Commit PaperMenuDropdown component**

```bash
git add src/components/PaperMenuDropdown.jsx
git commit -m "feat: add PaperMenuDropdown menu component"
```

---

## Chunk 4: Integration into MyPapers Page

### Task 5: Update MyPapers.jsx to integrate menu and dialog

**Files:**
- Modify: `frontend/src/pages/Papers/MyPapers.jsx`

- [ ] **Step 1: Add imports at the top of MyPapers.jsx**

Find the import section (first ~5 lines) and add:

```jsx
import DeletePaperDialog from "@/components/DeletePaperDialog";
import PaperMenuDropdown from "@/components/PaperMenuDropdown";
```

- [ ] **Step 2: Add state hooks for dialog**

In the MyPapers component, after the existing useState/useEffect, add:

```jsx
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [selectedPaper, setSelectedPaper] = useState(null);
```

- [ ] **Step 3: Add handler for delete button click**

Add this function in the MyPapers component (before the return statement):

```jsx
const handleDeleteClick = (paper) => {
  setSelectedPaper(paper);
  setDeleteDialogOpen(true);
};

const handleConfirmDelete = (paperId) => {
  setHistory(history.filter(item => item.id !== paperId));
  setDeleteDialogOpen(false);
  setSelectedPaper(null);
};

const handleCancelDelete = () => {
  setDeleteDialogOpen(false);
  setSelectedPaper(null);
};
```

- [ ] **Step 4: Replace the menu button in the paper card**

Find this line in the paper card JSX:
```jsx
<button className="text-slate-500 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
  <span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
```

Replace it with:
```jsx
<PaperMenuDropdown 
  onDelete={() => handleDeleteClick(item)}
/>
```

- [ ] **Step 5: Add the DeletePaperDialog component before closing div**

Right before the last `</div>` closing tag (after the Footer Stats section), add:

```jsx
{selectedPaper && (
  <DeletePaperDialog
    isOpen={deleteDialogOpen}
    paperName={selectedPaper.document_name}
    paperId={selectedPaper.id}
    onConfirm={handleConfirmDelete}
    onCancel={handleCancelDelete}
  />
)}
```

- [ ] **Step 6: Test build**

Run from frontend:
```bash
cd frontend && npm run build
```

Expected: Build should complete without errors

- [ ] **Step 7: Commit integration changes**

```bash
git add src/pages/Papers/MyPapers.jsx
git commit -m "feat: integrate delete menu and dialog into MyPapers page"
```

---

## Chunk 5: Testing & Verification

### Task 6: Manual end-to-end testing

**Files:**
- Test: User browser interaction

- [ ] **Step 1: Start backend server**

```bash
cd backend
python main.py
```

Expected: Server running on http://localhost:5000

- [ ] **Step 2: Start frontend dev server**

In another terminal:
```bash
cd frontend
npm run dev
```

Expected: Frontend running on http://localhost:5173 (or similar)

- [ ] **Step 3: Navigate to /papers page**

Open browser to http://localhost:5173/papers

Expected: Papers page loads with list of uploaded documents

- [ ] **Step 4: Click 3-dot menu on a paper**

Hover over a paper card and click the menu icon

Expected: Dropdown menu appears with "Delete Paper" option

- [ ] **Step 5: Click Delete Paper**

Click the "Delete Paper" option

Expected: Confirmation dialog appears showing paper name and warning

- [ ] **Step 6: Click Cancel**

Click the "Cancel" button in dialog

Expected: Dialog closes, paper still visible on page

- [ ] **Step 7: Click delete again and confirm**

Click menu → Delete Paper → Click "Delete" button

Expected: 
- Loading spinner shows
- Dialog closes
- Paper disappears from the list
- Page updates immediately

- [ ] **Step 8: Refresh page**

Press F5 to refresh

Expected: Paper does not reappear (deletion was persisted in database)

- [ ] **Step 9: Test with multiple papers**

Repeat delete process with another paper

Expected: Only selected paper is deleted, others remain

- [ ] **Step 10: Commit test verification**

```bash
git add -A
git commit -m "test: verify delete paper feature works end-to-end"
```

---

## Chunk 6: Final Review & Cleanup

### Task 7: Code review and optimization

- [ ] **Step 1: Review error handling**

Verify that:
- API errors are properly caught and displayed in dialog
- Network failures show user-friendly error messages
- Button states prevent double-clicks during deletion

Run: `cd frontend && grep -n "catch\|error\|Error" src/components/DeletePaperDialog.jsx`

- [ ] **Step 2: Check accessibility**

Verify:
- Dialog has proper z-index (z-50)
- Buttons have hover states
- Disabled states are visually indicated

Run: Visual inspection in browser

- [ ] **Step 3: Verify responsive design**

Test on different screen sizes:
```bash
# Use browser DevTools to test mobile/tablet sizes
# Open http://localhost:5173/papers
# Toggle device toolbar (F12 > Ctrl+Shift+M)
```

Expected: Menu and dialog work on all sizes

- [ ] **Step 4: Final git status check**

```bash
cd ../..
git status
```

Expected: All changes committed, no untracked files

- [ ] **Step 5: Create final summary commit**

```bash
git log --oneline -10
```

Review the last 10 commits to verify all feature commits are present.

- [ ] **Step 6: Document completion**

All tasks complete when:
✅ Backend DELETE endpoint created and tested
✅ Frontend API function added
✅ DeletePaperDialog component created
✅ PaperMenuDropdown component created
✅ MyPapers page integrated with new components
✅ End-to-end testing passed
✅ All changes committed

---

## Key Reference Points

- Backend validation ensures users can only delete their own papers
- Frontend optimistically removes paper from list after deletion
- Dialog prevents accidental deletions
- Error handling provides user feedback
- Components are reusable and follow project patterns
- All state management is local to avoid complex dependencies
