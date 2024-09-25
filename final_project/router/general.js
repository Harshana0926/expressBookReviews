const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
   const { username, password } = req.body;  // Extract the username and password from the request body

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Register the new user
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books, null, 4)); 
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;  // Extract the numeric key from the URL parameter
    const book = books[isbn];      // Access the book by its numeric key
    
    if (book) {
      res.send(JSON.stringify(book, null, 4));  // Send the book details formatted neatly
    } else {
      res.status(404).send(JSON.stringify({ error: 'Book not found' }, null, 4));  // Send error if the book is not found
    } // Send error if book is not found
    
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author.toLowerCase();  // Get the author from the URL parameters and convert to lowercase
    const matchingBooks = [];  // Array to store books by the author

  // Iterate through all the books and check if the author matches
  for (const key in books) {
    if (books[key].author.toLowerCase() === author) {
      matchingBooks.push(books[key]);  // If the author matches, add the book to the array
    }
  }

  // If there are matching books, send them
  if (matchingBooks.length > 0) {
    res.send(JSON.stringify(matchingBooks, null, 4));  // Return matching books in a nicely formatted JSON
  } else {
    res.status(404).send(JSON.stringify({ error: 'No books found for the specified author' }, null, 4));  // Send error if no books match
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
   const title = req.params.title.toLocaleLowerCase();
   const matchingTitle = [];

   //Iterate through all the books and check if the title matches
   for(const key in books){
     if(books[key].title.toLocaleLowerCase()===title){
        matchingTitle.push(books[key])
     }
   }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
   const isbn = req.params.isbn;  // Extract the ISBN from the URL parameters
  const book = books[isbn];      // Access the book by its ISBN

  if (book) {
    const reviews = book.reviews;  // Get the reviews of the book
    res.send(JSON.stringify(reviews, null, 4));  // Send the reviews formatted neatly
  } else {
    res.status(404).send(JSON.stringify({ error: 'Book not found' }, null, 4));  // Send error if the book is not found
  }
});

public_users.put('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Get ISBN from URL
    const review = req.query.review; // Get review from request query
    const username = req.session.authorization ? req.session.authorization.username : null; // Get the username from session
    
    // Check if the book exists in the 'books' database
    if (books[isbn]) {
        if (!username) {
            return res.status(403).json({ message: "User not logged in" });
        }

        // Check if the book already has reviews, if not, create an empty reviews object
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }

        // Add or modify the user's review for the book
        books[isbn].reviews[username] = review;

        // Respond with the updated reviews
        return res.status(200).json({
            message: `Review added/updated successfully for ISBN: ${isbn}`,
            reviews: books[isbn].reviews
        });
    } else {
        return res.status(404).json({ message: `Book with ISBN: ${isbn} not found` });
    }
});

public_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from the URL parameters
    const username = req.session.authorization ? req.session.authorization.username : null; // Get the username from the session

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    // Check if the book exists
    if (books[isbn]) {
        const reviews = books[isbn].reviews; // Get the book's reviews

        // Check if the user has posted a review
        if (reviews && reviews[username]) {
            // Delete the user's review
            delete reviews[username];

            return res.status(200).json({
                message: `Review by ${username} for ISBN: ${isbn} deleted successfully`,
                reviews: reviews
            });
        } else {
            return res.status(404).json({
                message: `No review found by user ${username} for ISBN: ${isbn}`
            });
        }
    } else {
        return res.status(404).json({ message: `Book with ISBN: ${isbn} not found` });
    }
});



module.exports.general = public_users;
