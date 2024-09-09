const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app = express();
const port = 3000;

app.use(express.json());

const db = new Sequelize({
    dialect: 'sqlite',
    storage: './db.sqlite',
    define: {
        timestamps: false,
    },
});

const Items = db.define('Items', {
    title: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
},
    {
        freezeTableName: true,
    });

db.sync()
    .then(() => {
        console.log('Database is Ok');
    });

// API
app.get('/', async (req, res) => {
    const result = await Items.findAll();
    if (result.length === 0) {
        return res.send('There are nothing to do!');
    };
    res.send(result);
});

app.get('/:id', async (req, res) => {
    const { id } = req.params;
    const result = await Items.findByPk(id);
    if (!result) {
        return res.status(404).send('Invalid Id');
    };
    res.send(result);
});

app.post('/', async (req, res) => {
    const { title, start, end } = req.body;
    if (!title || !start || !end) {
        return res.send('Invalid Credentionals');
    };

    const startDate = new Date(start);
    const endDate = new Date(end);
    console.log(startDate, endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).send('Invalid Date Format');
    };

    const Item = await Items.create({ title, start: startDate, end: endDate });
    res.status(200).send({ message: 'Successfully!', Item });
});

app.patch('/:id', async (req, res) => {
    const { id } = req.params;

    const { title, start, end } = req.body;
    if (!title || !start || !end) {
        return res.send('Invalid Credentionals');
    };

    const Item = await Items.findByPk(id);
    if (!Item) {
        return res.status(404).send('Invalid Id');
    };

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).send('Invalid Date Format');
    };

    Item.title = title;
    Item.start = startDate;
    Item.end = endDate;

    Item.save();

    res.send({ message: 'Succesfully!', Item });
});

app.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const Item = await Items.findByPk(id);

    if (!Item) {
        return res.status(404).send('Invalid Id');
    };

    await Item.destroy();

    res.send('Successfully!');
});

app.listen(port, () => {
    console.log(`Server is running on ${port} port`);
});