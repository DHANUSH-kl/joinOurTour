const showNewTrip = (req,res) => {
    res.render("admin/newTrip.ejs")
}

const addNewTrip = (req,res)=>{
    let {departure,tripTitle,totalDays,startLocation,tripDescription,} = req.body;
    console.log(departure);
    console.log(tripTitle);
    console.log(totalDays);
    console.log(startLocation);
    console.log(tripDescription);
    res.redirect("/");
}

export {showNewTrip , addNewTrip};
