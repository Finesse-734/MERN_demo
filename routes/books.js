const express = require('express');
const router =  express.Router();
const Book = require('../models/book');
const Author = require('../models/author');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']


//All books route
router.get('/', async (req, res)=>{
    let query = Book.find()
    if(req.query.title != null && req.query.title!=''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore!=''){
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter!=''){
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try{
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
           })
    }
    catch{
        res.redirect('/')
    }
   
})

//new book route
router.get('/new', async (req, res)=>{
   renderNewPage(res, new Book())
})

//create a new book route
router.post('/', async (req, res)=>{
    
    const book =  new Book({
        title: req.body.title,
        publishDate: new Date(req.body.publishDate),
        author: req.body.author,
        pageCount: req.body.pageCount,
       
        description: req.body.description,

    })
    saveCover(book, req.body.cover)
    try{
        const newBook = await book.save()
        res.redirect(`/books/${newBook.id}`)
    }catch{
        
        renderNewPage(res, book, true)
    }
   
})
//show book route
router.get('/:id', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show', {book: book})
    }catch{
        res.redirect('/')
    }
})

//edit book route
router.get('/:id/edit', async (req, res)=>{
    try{
        const book = await Book.findById(req.params.id)
        renderEditPage(res, new Book())
    }catch{
        res.redirect('/')
    }
 })

 //update a book route
router.put('/:id', async (req, res)=>{
    
    let book
    
    try{
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        console.log(book)
        if(req.body.cover!=null && req.body.cover !==''){
            saveCover(book, req.body.cover)
        }
        await Book.save()
        res.redirect(`/books/${newBook.id}`)
    }catch{
        if(book != null){
            renderEditPage(res, book, true)
        }else{
            res.redirect('/')
        }
    }
   
})

//Delete Book Page
router.delete('/:id', async (req, res) => {
    let book
    try{
        book = await Book.findById(req.params.id)
        await book.deleteOne()
        res.redirect('/books')
    }catch{
        if(book != null){
            res.render('books/show', {
                book: book,
                errorMessage: "Could not delete book"
            })
        }
        else{
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, book, hasError = false) {
   renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError){
            if(form=="new"){
                params.errorMessage = "Error creating book"
            }
            if(form=="edit"){
                params.errorMessage = "Error editing book"
            }
        }
        res.render(`books/${form}`, params)
       }catch{
        res.redirect('/books')
       }
}

function saveCover(book, coverEncoded){
    
    if(coverEncoded == null)return;
    const cover = JSON.parse(coverEncoded)
    if(cover!=null && imageMimeTypes.includes(cover.type)){
            book.coverImage = Buffer.from(cover.data, 'base64')
            book.coverImageType = cover.type
    }
}

module.exports = router;