document.addEventListener('DOMContentLoaded', function () {
    const books = [];
    const RENDER_EVENT = 'render-books';
    const STORAGE_KEY = 'BOOKSHELF_APPS';

    const bookForm = document.getElementById('bookForm');
    const searchForm = document.getElementById('searchBook');
    const editForm = document.getElementById('editBookForm');

    function isStorageExist() {
        if (typeof (Storage) === 'undefined') {
            alert('Browser Anda tidak mendukung local storage');
            return false;
        }
        return true;
    }

    function saveData() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(books);
            localStorage.setItem(STORAGE_KEY, parsed);
        }
    }

    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);
        if (data !== null) {
            for (const book of data) {
                books.push(book);
            }
        }
        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    function generateId() {
        return +new Date();
    }

    function generateBookObject(id, title, author, year, isComplete) {
        return { id, title, author, year: parseInt(year), isComplete };
    }

    function findBook(bookId) {
        for (const bookItem of books) {
            if (bookItem.id === bookId) return bookItem;
        }
        return null;
    }

    function findBookIndex(bookId) {
        for (const index in books) {
            if (books[index].id === bookId) return index;
        }
        return -1;
    }

    // --- PEMBARUAN ---
    // Tombol aksi sekarang menggunakan ikon dari Font Awesome
    function makeBookElement(bookObject) {
        const bookItem = document.createElement('div');
        bookItem.classList.add('book_item');
        bookItem.setAttribute('data-bookid', bookObject.id);
        bookItem.setAttribute('data-testid', 'bookItem');

        const bookTitle = document.createElement('h3');
        bookTitle.innerText = bookObject.title;
        bookTitle.setAttribute('data-testid', 'bookItemTitle');

        const bookAuthor = document.createElement('p');
        bookAuthor.innerText = `Penulis: ${bookObject.author}`;
        bookAuthor.setAttribute('data-testid', 'bookItemAuthor');

        const bookYear = document.createElement('p');
        bookYear.innerText = `Tahun: ${bookObject.year}`;
        bookYear.setAttribute('data-testid', 'bookItemYear');

        const actionContainer = document.createElement('div');
        actionContainer.classList.add('action');

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('red');
        deleteButton.innerHTML = '<i class="fas fa-trash-can"></i>';
        deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
        deleteButton.setAttribute('title', 'Hapus buku');
        deleteButton.addEventListener('click', () => removeBook(bookObject.id));

        const editButton = document.createElement('button');
        editButton.classList.add('yellow');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.setAttribute('data-testid', 'bookItemEditButton');
        editButton.setAttribute('title', 'Edit buku');
        editButton.addEventListener('click', () => openEditModal(bookObject.id));

        if (bookObject.isComplete) {
            const incompleteButton = document.createElement('button');
            incompleteButton.classList.add('green');
            incompleteButton.innerHTML = '<i class="fas fa-rotate-left"></i>';
            incompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
            incompleteButton.setAttribute('title', 'Pindahkan ke "Belum Selesai"');
            incompleteButton.addEventListener('click', () => moveBookToIncomplete(bookObject.id));
            actionContainer.append(incompleteButton, editButton, deleteButton);
        } else {
            const completeButton = document.createElement('button');
            completeButton.classList.add('green');
            completeButton.innerHTML = '<i class="fas fa-check"></i>';
            completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
            completeButton.setAttribute('title', 'Pindahkan ke "Selesai Dibaca"');
            completeButton.addEventListener('click', () => moveBookToComplete(bookObject.id));
            actionContainer.append(completeButton, editButton, deleteButton);
        }

        bookItem.append(bookTitle, bookAuthor, bookYear, actionContainer);
        return bookItem;
    }

    // --- PEMBARUAN ---
    // Menambahkan notifikasi SweetAlert setelah aksi
    function addBook() {
        const title = document.getElementById('bookFormTitle').value;
        const author = document.getElementById('bookFormAuthor').value;
        const year = document.getElementById('bookFormYear').value;
        const isComplete = document.getElementById('bookFormIsComplete').checked;

        const generatedID = generateId();
        const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
        books.push(bookObject);

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        bookForm.reset();

        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Buku baru telah ditambahkan ke rak.',
            timer: 1500,
            showConfirmButton: false
        });
    }

    function moveBookToComplete(bookId) {
        const bookTarget = findBook(bookId);
        if (bookTarget == null) return;
        bookTarget.isComplete = true;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        Swal.fire({ icon: 'success', title: 'Berhasil Dipindahkan', text: 'Buku telah dipindahkan ke rak "Selesai Dibaca".', timer: 1500, showConfirmButton: false });
    }

    function moveBookToIncomplete(bookId) {
        const bookTarget = findBook(bookId);
        if (bookTarget == null) return;
        bookTarget.isComplete = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        Swal.fire({ icon: 'success', title: 'Berhasil Dipindahkan', text: 'Buku telah dipindahkan ke rak "Belum Selesai Dibaca".', timer: 1500, showConfirmButton: false });
    }

    // --- PEMBARUAN ---
    // Menambahkan dialog konfirmasi sebelum menghapus
    function removeBook(bookId) {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Anda tidak akan bisa mengembalikan buku yang dihapus!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus buku!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                const bookTargetIndex = findBookIndex(bookId);
                if (bookTargetIndex === -1) return;
                books.splice(bookTargetIndex, 1);
                document.dispatchEvent(new Event(RENDER_EVENT));
                saveData();
                Swal.fire('Dihapus!', 'Buku Anda telah berhasil dihapus.', 'success');
            }
        });
    }

    function searchBookByTitle(title) {
        const filteredBooks = books.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
        renderFilteredBooks(filteredBooks);
    }

    function renderFilteredBooks(filteredBooks) {
        const incompleteBookList = document.getElementById('incompleteBookList');
        const completeBookList = document.getElementById('completeBookList');
        incompleteBookList.innerHTML = '';
        completeBookList.innerHTML = '';
        for (const bookItem of filteredBooks) {
            const bookElement = makeBookElement(bookItem);
            if (bookItem.isComplete) {
                completeBookList.append(bookElement);
            } else {
                incompleteBookList.append(bookElement);
            }
        }
    }

    bookForm.addEventListener('submit', (event) => { event.preventDefault(); addBook(); });
    document.getElementById('searchBookTitle').addEventListener('keyup', function () {
        const searchTitle = this.value;
        if (searchTitle === '') {
            document.dispatchEvent(new Event(RENDER_EVENT));
        } else {
            searchBookByTitle(searchTitle);
        }
    });

    document.getElementById('bookFormIsComplete').addEventListener('change', function () {
        const submitButtonSpan = document.querySelector('#bookFormSubmit span');
        submitButtonSpan.innerText = this.checked ? 'Selesai Dibaca' : 'Belum Selesai Dibaca';
    });

    document.addEventListener(RENDER_EVENT, function () {
        const incompleteBookList = document.getElementById('incompleteBookList');
        const completeBookList = document.getElementById('completeBookList');
        incompleteBookList.innerHTML = '';
        completeBookList.innerHTML = '';
        for (const bookItem of books) {
            const bookElement = makeBookElement(bookItem);
            if (bookItem.isComplete) {
                completeBookList.append(bookElement);
            } else {
                incompleteBookList.append(bookElement);
            }
        }
    });

    const modal = document.getElementById('editModal');
    const closeButton = document.querySelector('.close-button');
    function openEditModal(bookId) {
        const book = findBook(bookId);
        if (!book) return;
        document.getElementById('editBookId').value = book.id;
        document.getElementById('editBookTitle').value = book.title;
        document.getElementById('editBookAuthor').value = book.author;
        document.getElementById('editBookYear').value = book.year;
        modal.style.display = 'block';
    }
    function closeEditModal() { modal.style.display = 'none'; }
    closeButton.onclick = closeEditModal;
    window.onclick = (event) => { if (event.target == modal) { closeEditModal(); } }

    editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const book = findBook(parseInt(document.getElementById('editBookId').value));
        if (book) {
            book.title = document.getElementById('editBookTitle').value;
            book.author = document.getElementById('editBookAuthor').value;
            book.year = parseInt(document.getElementById('editBookYear').value);
            saveData();
            document.dispatchEvent(new Event(RENDER_EVENT));
            closeEditModal();
            Swal.fire({ icon: 'success', title: 'Tersimpan!', text: 'Perubahan data buku telah disimpan.', timer: 1500, showConfirmButton: false });
        }
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

