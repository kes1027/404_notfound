document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('board');
  const modal = document.getElementById('noteModal');
  const addButton = document.getElementById('addNote');
  const closeButton = document.querySelector('.close');
  const saveButton = document.getElementById('saveNote');
  const colorPicker = document.getElementById('colorPicker');

  let notes = [];

  // Sortable.js 초기화
  const sortable = new Sortable(board, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    dragClass: 'dragging',
    handle: '.note',
  });

  // 모든 메모를 로드하는 함수
  function loadAllNotes() {
    const notesRef = firebase.database().ref('notes');
    notesRef.on('value', (snapshot) => {
      const data = snapshot.val();
      notes = data ? Object.values(data) : [];
      displayNotes();
    });
  }

  // 메모 저장 함수
  function saveNote() {
    const auth = firebase.auth();
    if (!auth.currentUser) {
      alert('로그인이 필요합니다!');
      return;
    }

    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const color = colorPicker.value;

    if (!title || !content) {
      alert('제목과 내용을 모두 입력해주세요!');
      return;
    }

    try {
      const notesRef = firebase.database().ref('notes');
      const newNoteRef = notesRef.push();

      // 한국 시간 포맷팅
      const now = new Date();
      const koreanDate = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now);

      newNoteRef.set({
        id: newNoteRef.key,
        title,
        content,
        color,
        date: koreanDate,
        userId: auth.currentUser.uid,
        author: auth.currentUser.displayName || '익명', // Google 로그인 사용자의 이름 표시
      });

      modal.style.display = 'none';
      clearModal();
    } catch (error) {
      console.error('메모 저장 실패:', error);
      alert('메모 저장에 실패했습니다.');
    }
  }

  // 메모 삭제 함수
  function deleteNote(noteId) {
    const auth = firebase.auth();
    if (!auth.currentUser) {
      alert('로그인이 필요합니다!');
      return;
    }

    // 해당 노트의 작성자 확인
    const noteRef = firebase.database().ref(`notes/${noteId}`);
    noteRef.once('value', (snapshot) => {
      const note = snapshot.val();
      if (note && note.userId === auth.currentUser.uid) {
        if (confirm('이 메모를 삭제하시겠습니까?')) {
          noteRef.remove().catch((error) => {
            console.error('메모 삭제 실패:', error);
            alert('메모 삭제에 실패했습니다.');
          });
        }
      } else {
        alert('자신이 작성한 메모만 삭제할 수 있습니다.');
      }
    });
  }

  // 메모 표시 함수
  function displayNotes() {
    board.innerHTML = notes
      .map(
        (note) => `
          <div class="note" style="background-color: ${note.color}" data-id="${note.id}">
              <div class="note-header">
                  <h3 class="note-title">${note.title}</h3>
                  <button class="delete-btn" onclick="deleteNote('${note.id}')">×</button>
              </div>
              <p class="note-content">${note.content}</p>
              <div class="note-footer">
                  <span class="note-date">${note.date}</span>
                  <span class="note-author">작성자: ${note.author}</span>
              </div>
          </div>
      `
      )
      .join('');
  }

  function clearModal() {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    colorPicker.value = '#ffffff';
  }

  // 이벤트 리스너
  if (addButton) addButton.onclick = () => (modal.style.display = 'block');
  if (closeButton) closeButton.onclick = () => (modal.style.display = 'none');
  if (saveButton) saveButton.onclick = saveNote;

  // 전역 함수로 설정
  window.deleteNote = deleteNote;
  window.loadAllNotes = loadAllNotes;

  // 초기 로드
  loadAllNotes();
});
