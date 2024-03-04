const express = require('express')
const router = express.Router()
const Book = require('../models/book.model')

//MIDDLEWARE
const getBook = async (req, res, next) => {
    let book;
    const { id } = req.params;

    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        return res.status(400).json({
            message: 'Id no valido'
        })
    }

    try {
        book = await Book.findById(id);
        if(!book){
            return res.status(404).json({
                message: 'No existe el libro'
            })
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }

    res.book = book;
    next();
}

//obtener todos los libros [GET ALL]

router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        if (books.length === 0) {
            return res.status(204).json([])
        }
        res.json(books)
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
})

// Crear un nuevo libro(recurso) [POST]

router.post('/', async (req, res) => {
    const { title, author, genre, publication_date } = req?.body
    if(!title || !author || !genre || !publication_date){
        return res.status(400).json({
            message: 'Faltan datos'
        })
    }

    const book = new Book(
        {
            title, 
            author, 
            genre, 
            publication_date
        }
    )

    try {
        const newBook = await book.save()
        res.status(201).json(newBook)
    } catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})


//Obtener un solo libro [GET]

router.get('/:id', getBook, async (req, res) => {
    res.json(res.book)
})

// Actualizar un libro [PUT]

router.put('/:id', getBook, async (req, res) => {
    try {
        const book = res.book
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.publication_date = req.body.publication_date || book.publication_date;

        const updatedBook = await book.save()
        res.json(updatedBook)

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

// Actualizar una caracteristica de un libro [PATCH]

router.patch('/:id', getBook, async (req, res) => {

    if(!req.body.title && !req.body.author && !req.body.genre && !req.body.publication_date){
        res.status(400).json({
            message: 'Faltan datos'
        })
    }
    try {
        const book = res.book
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.publication_date = req.body.publication_date || book.publication_date;

        const updatedBook = await book.save()
        res.json(updatedBook)

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

// Eliminar un libro [DELETE]

router.delete('/:id', getBook, async (req, res) => {
    try {
        const book = res.book
        await res.book.deleteOne({
            _id: book._id
        });
        res.json({
            message: `${book.title} fue eliminado exitosamente`
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
})


module.exports = router