const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds')
const {isLoggedIn, isAuthorized, validateCampground} = require('../middleware');
const multer = require('multer')
const {storage} = require('../cloudinary');
const upload = multer({storage});


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))


// router.get('/new', isLoggedIn, campgrounds.renderNewForm)
router.get('/new', campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthorized, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthorized, catchAsync(campgrounds.deleteCampground));


router.get('/:id/edit', isLoggedIn, isAuthorized, catchAsync(campgrounds.renderEditForm))


module.exports = router;