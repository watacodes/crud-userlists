// Imports

const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');

// Image uploader

let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname);
  }
});

let upload = multer({
  storage: storage,
}).single('image');

// Insert user info into a database route 

router.post('/add', upload, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });

  try {
    user = await user.save();
    req.session.message = {
      type: 'success',
      message: 'User added successfully!',
    };
    res.redirect('/');
  } catch (err) {
    console.log(err);
  }
  
  // user.save()
  //     .then(() => {
  //       res.render('./index.ejs', {
  //         type: 'success',
  //         message: 'User added successfully!',
  //       });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
});

router.get('/', (req, res) => {
  User.find()
      .then((users) => {
        console.log(users)
        res.render('index', {
          title: 'Home Page',
          users: users,
        });
      })
      .catch((err) => console.log(err));
});

router.get('/add', (req, res) => {
  res.render('add_users', {
    title: 'Add Users',
  });
});

// Edit the user route

router.get('/edit/:id', (req, res) => {
  let id = req.params.id;
  User.findById(id)  
      .then((user) => {
        console.log(user);
        if (user == null) {
          res.redirect('/');
        } else {
          res.render('edit_users', {
            title: 'Edit User',
            user: user,
          })
        }
      })
      .catch((err) => res.redirect('/'));
});

// Update the user route

router.post('/update/:id', upload, (req, res) => {
  let id = req.params.id;
  let newImage = '';

  if (req.file) {
    newImage = req.file.filename;
    try {
      fs.unlinkSync('./uploads/' + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    newImage = req.body.old_image;
  }

  User.findByIdAndUpdate(id, {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: newImage,
  }).then(() => {
    req.session.message = {
      type: 'success',
      message: 'User updated the info successfully!',
    };
    res.redirect('/');
  }).catch(err => console.log(err));
});

// Delete the user route

router.get('/delete/:id', (req, res) => {
  let id = req.params.id;
  User.findByIdAndRemove(id)
      .then((result) => {
        console.log(result);
        console.log(result.image)
        if (result.image != '') {
          try {
            fs.unlinkSync('./uploads/' + result.image);
          } catch (err) {
            console.log(err);
          }
        }
        req.session.message = {
          type: 'info',
          message: 'User deleted successfully!',
        }
        res.redirect('/');
      })
      .catch((err) => {
        console.log(err);
      });
});

module.exports = router;