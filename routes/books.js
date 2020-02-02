const express = require('express')
const ObjectId = require('mongodb').ObjectID;

const router = express.Router()
const path = require('path')
const fs = require('fs')
const Book = require('../models/book')
const Author = require('../models/author')
const uploadPath = path.join('public', Book.coverImageBasePath)
 const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
// const upload = multer({
//   dest: uploadPath,
//   fileFilter: (req, file, callback) => {
//     callback(null, imageMimeTypes.includes(file.mimetype))
//   }
// })

// All Books Route



router.get('/', async (req, res) => {
    let query = Book.find();
    if(req.query.title !=null && req.query.title !== '')
      query = query.regex('title', new RegExp(req.query.title, 'i'));
      if(req.query.publishedAfter !=null && req.query.publishedAfter !== '')
      query = query.gte('publishDate', req.query.publishedAfter);
      if(req.query.publishedBefore !=null && req.query.publishedBefore !== '')
      query = query.lte('publishDate', req.query.publishedBefore);

    try {
     
   
      const books = await query.exec();
      res.render('books/index',{
        books:books,
        searchOptions: req.query
      });
    } catch (error) {
      res.redirect('/');
    }
})

// New Book Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
})

// Create Book Route
router.post('/', async (req, res) => {

   
    const book = new Book({
      title: req.body.title,
     author:  new ObjectId(req.body.author),
      publishDate: new Date(req.body.publishDate),
      pageCount: req.body.pageCount,
      description: req.body.description
    })

    saveCover(book, req.body.cover);
  try {
  await book.save()
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`)
  } catch(e) {

    renderNewPage(res, book, true)
  }
})



async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }
    if (hasError) params.errorMessage = 'Error Creating Book'
    res.render('books/new', params)
  } catch(e) {
    res.redirect('/books')
  }
}
function saveCover(book, covertEncoded){
  if(covertEncoded == null) return;
  const cover = JSON.parse(covertEncoded);
  if(cover != null && imageMimeTypes.includes(cover.type)){
    book.coverImage = new Buffer.from(cover.data, 'base64');
    book.coverImageType =cover.type;
  }
}
router.get('/:id/edit',async (req, res) =>{
  try {
     const authors = await Author.find({})
      const book = await Book.findById(req.params.id)
   
      res.render('books/edit', {  authors:authors,book:book}) 
  } catch (error) {
      res.redirect('/books')
  }
})
router.get('/:id',async (req, res) =>{
  try {
    const book = await Book.findById(req.params.id).populate('author').exec()
      const author = await Author.findById( book.author)
      res.render('books/show',{
          author:author,
          book:book
      })
  } catch (error) {
      res.redirect('/')
  }
})
router.put('/:id',async (req, res) =>{
  let book
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author=  new ObjectId(req.body.author)
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if( req.body.cover != null &&  req.body.cover !== '') 
        saveCover(book, req.body.cover);
        await book.save()
        res.redirect(`/books`)
    } catch (error) {
        if(book == null)
        res.redirect('/')
        else{
            res.render('book/edit',{
              book:book,
                errorMessage:'error update'
            })
        }
        
    }
})
router.delete('/:id',async (req, res) =>{
  let book
  try {
      book = await Book.findById(req.params.id)
      
      await book.remove()
      res.redirect(`/books`)
  } catch (error) {
      
      res.redirect('/')
    
      
  }
})
module.exports = router