const express = require("express");
const app = express();
const port = 8800;

const db = require("./connection/db");

app.set("view engine", "hbs");

app.use("/public", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

// let projects = [
//   {
//     title: "contoh",
//     descr: "Teguh",
//     duration: [],
//   },
// ];

app.get("/", function (req, res) {
  res.send("hello");
});

app.get("/home", function (req, res) {
  // console.log(projects);

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query("SELECT * FROM tb_project", function (err, result) {
      if (err) throw err;
      let data = result.rows;

      data = data.map(function (item) {
        return {
          ...item,
          title: item.title,
          descr: item.description,
          start: item.startDate,
          end: item.endDate,
          duration: getDuration(item.startDate, item.endDate),
          node: checkboxes(item.technologies[0]),
          react: checkboxes(item.technologies[1]),
          next: checkboxes(item.technologies[2]),
          type: checkboxes(item.technologies[3]),
        };
      });
      res.render("index", { projects: data });
      console.log(data);
    });
  });

  // res.render("index", { projects: data });
});

app.get("/add-project", function (req, res) {
  res.render("add-project");
});

app.post("/add-project", function (req, res) {
  let data = req.body;

  // data = {
  //   // startDate: getFullTime(data.startDate),
  //   // endDate: getFullTime(data.endDate),
  //   node: checkboxes(data.inputNode),
  //   react: checkboxes(data.inputReact),
  //   next: checkboxes(data.inputNext),
  //   type: checkboxes(data.inputType),
  // };

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      `INSERT INTO public.tb_project( title, "startDate", "endDate", description, technologies, image) 
      VALUES ('${data.projectName}', '${data.inputDateStart}', '${data.inputDateEnd}', '${data.inputDesc}', '{${data.inputNode}, ${data.inputReact}, ${data.inputNext}, ${data.inputType}}', 'image.png')`,
      function (err, result) {
        if (err) throw err;
        done();

        res.redirect("/home"); // berpindah halaman ke route /blog
      }
    );
  });
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

app.get("/edit-project/:id", function (req, res) {
  let id = req.params.id;
  db.connect((err, client, done) => {
    if (err) throw err;

    client.query(`SELECT * FROM tb_project WHERE id = ${id}`, (err, result) => {
      if (err) throw err;
      done();
      let data = result.rows[0];

      (data.startDate = getFullTime(data.startDate)),
        (data.endDate = getFullTime(data.endDate)),
        (data.node = checkboxes(data.technologies[0])),
        (data.react = checkboxes(data.technologies[1])),
        (data.next = checkboxes(data.technologies[2])),
        (data.type = checkboxes(data.technologies[3])),
        res.render("edit-project", { update: data, id });
    });
  });
});

app.post("/edit-project/:id", function (req, res) {
  let data = req.body;
  let id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;
    done();

    client.query(
      `UPDATE public.tb_project SET  title='${data.projectName}', "startDate"='${data.inputDateStart}', "endDate"='${data.inputDateEnd}',
       description='${data.inputDesc}', technologies='{${data.inputNode}, ${data.inputReact}, ${data.inputNext}, ${data.inputType}}', image='image.png'
      WHERE id=${id}`,
      function (err, result) {
        if (err) throw err;

        res.redirect("/home"); // berpindah halaman ke route /blog
      }
    );
  });
});

app.get("/project-detail/:id", function (req, res) {
  const id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(`SELECT * FROM tb_project WHERE id=${id}`, function (err, result) {
      if (err) throw err;
      done();

      let data = result.rows[0];

      (data.startDate = getFullTime(data.startDate)),
        (data.endDate = getFullTime(data.endDate)),
        (data.duration = getDuration(data.startDate, data.endDate)),
        (data.node = checkboxes(data.technologies[0])),
        (data.react = checkboxes(data.technologies[1])),
        (data.next = checkboxes(data.technologies[2])),
        (data.type = checkboxes(data.technologies[3])),
        res.render("project-detail", { projects: data });
      console.log(data);
    });
  });
});

// app.get("/delete-project/:index", function (req, res) {
//   console.log(req.params.index);

//   let index = req.params.index;

//   projects.splice(index, 1);

//   res.redirect("/home");
// });

app.get("/delete-project/:id", function (req, res) {
  const id = req.params.id;

  const query = `DELETE FROM tb_project WHERE id=${id}`;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      res.redirect("/home"); // berpindah halaman ke route /blog
    });
  });
});

app.listen(port, function () {
  console.log(`server listen on port ${port}`);
});

function getDuration(start, end) {
  let sdate = new Date(start);
  let edate = new Date(end);
  let duration = edate.getTime() - sdate.getTime();
  let monthDuration = Math.ceil(duration / (1000 * 3600 * 24 * 30));
  let day = duration / (1000 * 3600 * 24);

  if (day < 30) {
    return day + " Hari";
  } else if (day > 30 && day <= 30) {
    return day + " bulan";
  } else if (monthDuration < 12) {
    return monthDuration + " Bulan";
  }
}

function getFullTime(waktu) {
  let month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "Sept", "October", "December"];

  let date = waktu.getDate().toString().padStart(2, "0");

  // console.log(date);
  let monthIndex = (waktu.getMonth() + 1).toString().padStart(2, "0");

  // console.log(month[monthIndex]);

  let year = waktu.getFullYear();
  // console.log(year);

  let hours = waktu.getHours();
  let minutes = waktu.getMinutes();

  let fullTime = `${year}-${monthIndex}-${date}`;
  return fullTime;
}

function checkboxes(condition) {
  if (condition === "on") {
    return true;
  } else {
    return false;
  }
}
