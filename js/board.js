document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('board');
  const modal = document.getElementById('noteModal');
  const addButton = document.getElementById('addNote');
  const closeButton = document.querySelector('.close');
  const saveButton = document.getElementById('saveNote');
  const colorPicker = document.getElementById('colorPicker');

  let notes = JSON.parse(localStorage.getItem('notes') || '[]');

  // Sortable.js 초기화
  const sortable = new Sortable(board, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    dragClass: 'dragging',
    handle: '.note',
    onEnd: function (evt) {
      const itemEl = evt.item;
      const newIndex = evt.newIndex;
      const oldIndex = evt.oldIndex;

      const note = notes.splice(oldIndex, 1)[0];
      notes.splice(newIndex, 0, note);

      localStorage.setItem('notes', JSON.stringify(notes));
    },
  });

  function displayNotes() {
    board.innerHTML = notes
      .map(
        (note, index) => `
        <div class="note" style="background-color: ${note.color}" data-index="${index}">
            <div class="note-header">
                <h3 class="note-title">${note.title}</h3>
                <button class="delete-btn" onclick="deleteNote(${index})" title="삭제">×</button>
            </div>
            <p class="note-content">${note.content}</p>
            <div class="note-footer">
                <span>${note.date}</span>
            </div>
        </div>
    `
      )
      .join('');
  }

  function saveNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const color = colorPicker.value;

    if (!title || !content) {
      alert('제목과 내용을 모두 입력해주세요!');
      return;
    }

    notes.unshift({
      title,
      content,
      color,
      date: new Date().toLocaleString('ko-KR'),
    });

    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
    modal.style.display = 'none';
    clearModal();
  }

  function clearModal() {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    colorPicker.value = '#ffffff';
  }

  window.deleteNote = function (index) {
    if (confirm('이 메모를 삭제하시겠습니까?')) {
      notes.splice(index, 1);
      localStorage.setItem('notes', JSON.stringify(notes));
      displayNotes();
    }
  };

  // 이벤트 리스너
  addButton.onclick = () => (modal.style.display = 'block');
  closeButton.onclick = () => (modal.style.display = 'none');
  saveButton.onclick = saveNote;

  // 모달 외부 클릭 시 닫기
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // 초기 노트 표시
  displayNotes();
});
