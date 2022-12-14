const express = require('express')

const app = express()
const port = 5000

app.set('view engine', 'hbs') // set view engine hbs
app.use('/assets', express.static(__dirname + '/assets')) // path folder assets
app.use(express.urlencoded({ extended: false }))

const db = require('./connection/db')


app.get("/", function (request, response) {

    db.connect(function (err, client, done) {
        if (err) throw err // menampilkan error koneksi database

        client.query('SELECT * FROM tb_projects ORDER BY id DESC', function (err, result) {
            if (err) throw err // menampilkan error dari query

            console.log(result.rows)
            let data = result.rows

            let blog = data.map(function (item) {
                return {
                    ...item,
                    duration: getDistanceTime(new Date(item.start_date), new Date(item.end_date))

                }
            })

            response.render('index', { dataBlog: blog })
        })

    })
});
app.get('/blog-detail/:idParams', function (request, response) {
    let id = request.params.idParams

    db.connect(function (err, client, done) {
        if (err) throw err // menampilkan error koneksi database

        let query = `SELECT * FROM tb_projects WHERE id=${id}`

        client.query(query, function (err, result) {
            if (err) throw err // menampilkan error dari query

            console.log(result.rows[0].post_at);
            let data = result.rows
            let dataBlog = data.map(function (item) {
                return {
                    ...item,
                    start_date: getFullTime(item.start_date),
                    end_date: getFullTime(item.end_date),
                    duration: getDistanceTime(new Date(item.start_date), new Date(item.end_date))

                }
            })

            response.render('blog-detail', { data: dataBlog[0] })
        })

    })

});
app.get('/contact', function (request, response) {
    response.render('contact')
})
app.get("/myproject", function (request, response) {
    response.render("myproject");
});
app.post('/myproject', function (request, response) {
    // console.log(request.body);
    let title = request.body.inputTitle;
    let startDate = request.body.inputStartDate;
    let endDate = request.body.inputEndDate;
    let content = request.body.inputContent;
    let android = request.body.android;
    let react = request.body.react;
    let nodejs = request.body.nodejs;
    let squarejs = request.body.squarejs;

    db.connect(function (err, client, done) {
        if (err) throw err // menampilkan error koneksi database

        let query = `INSERT INTO tb_projects (title,start_date,end_date, content,technologies) VALUES
                        ('${title}','${startDate}','${endDate}','${content}','{"${android}","${react}","${nodejs}","${squarejs}"}');`

        client.query(query, function (err, result) {
            if (err) throw err // menampilkan error dari query

            response.redirect('/')
        })


    })
});

app.get('/update-blog/:idParams', function (request, response) {
    let id = request.params.idParams

    db.connect(function (err, client, done) {
        if (err) throw err // menampilkan error koneksi database

        let query = `SELECT * FROM tb_projects WHERE id=${id}`

        client.query(query, function (err, result) {
            if (err) throw err // menampilkan error dari query

            let data = result.rows

            response.render('update-blog', { data: data[0] })
        })

    })
});


app.post('/update-blog/:idParams', function (request, response) {
    let id = request.params.idParams
    // console.log(request.body);
    let title = request.body.inputTitle;
    let startDate = request.body.inputStartDate;
    let endDate = request.body.inputEndDate;
    let content = request.body.inputContent;
    let android = request.body.android;
    let react = request.body.react;
    let nodejs = request.body.nodejs;
    let squarejs = request.body.squarejs;


    db.connect(function (err, client, done) {
        if (err) throw err // menampilkan error koneksi database

        let query = `UPDATE public.tb_projects
        SET  title='${title}', start_date='${startDate}', end_date='${endDate}', content='${content}',
        technologies = '{${android},${react},${nodejs},${squarejs}}'
        WHERE id ='${id}';`
        client.query(query, function (err, result) {
            if (err) throw err // menampilkan error dari query

            response.redirect('/')
        })


    })
});

app.get('/delete-blog/:idParams', function (request, response) {
    let id = request.params.idParams

    db.connect(function (err, client, done) {
        if (err) throw err // menampilkan error koneksi database

        let query = `DELETE FROM tb_projects WHERE id=${id}`

        client.query(query, function (err, result) {
            if (err) throw err // menampilkan error dari query
            response.redirect('/')
        })

    })
});


function getFullTime(time) {

    let month = ["Januari", "Febuari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "Nopember", "Desember"]

    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    let fullTime = `${date} ${month[monthIndex]} ${year}`
    return fullTime
}
function getDistanceTime(time, end) {
    let timeNow = end;
    let timePost = time;

    let distance = timeNow - timePost;

    let milisecond = 1000;
    let secondInHours = 3600;
    let hoursInDay = 24;
    let daysInMonth = 30;

    let distanceMonth = Math.floor(distance / (milisecond * secondInHours * hoursInDay * daysInMonth));
    let distanceDay = Math.floor(distance / (milisecond * secondInHours * hoursInDay));
    let distanceHours = Math.floor(distance / (milisecond * 60 * 60));
    let distanceMinutes = Math.floor(distance / (milisecond * 60));
    let distanceSeconds = Math.floor(distance / milisecond);

    if (distanceMonth > 0) {
        return `${distanceMonth} bulan `;
    } else if (distanceDay > 0) {
        return `${distanceDay} hari `;
    } else if (distanceHours > 0) {
        return `${distanceHours} jam `;
    } else if (distanceMinutes > 0) {
        return `${distanceMinutes} menit`;
    } else {
        return `${distanceSeconds} detik`;
    }
}

app.listen(port, function () {
    console.log(`server running on port ${port}`);
})