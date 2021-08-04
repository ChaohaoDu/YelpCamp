const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');



module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}


module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(file => ({url: file.path, filename: file.filename}))
    campground.author = req.user._id;
    await campground.save();
    // console.log(campground)
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // console.log(campground)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    } else {
        res.render('campgrounds/show', {campground});
    }
}


module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
    } else {
        res.render('campgrounds/edit', {campground});
    }
}

module.exports.updateCampground = async (req, res) => {
    const {id} = req.params;
    // console.log(req.body);
    const imgs = req.files.map(file => ({url: file.path, filename: file.filename}));
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    camp.images.push(...imgs);
    await camp.save();

    // delete images
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        // pull out the images that filename is mentioned in req.body.deletedImages
        await camp.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${camp._id}`)
};


module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted review');
    res.redirect('/campgrounds');
}