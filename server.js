const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// Servir la carpeta 'uploads' como estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar middleware para parsear JSON
app.use(express.json());

// Ruta para obtener las carpetas y archivos dentro de uploads
app.get('/api/salidas', (req, res) => {
    fs.readdir('uploads', (err, folders) => {
        if (err) {
            return res.status(500).json({ error: 'No se pueden leer las carpetas' });
        }

        const carpetas = folders.filter(folder => fs.lstatSync(path.join('uploads', folder)).isDirectory());
        const salidaArchivos = carpetas.map(carpeta => {
            const archivos = fs.readdirSync(path.join('uploads', carpeta))
                .filter(file => /\.(jpg|jpeg|png|gif|mp4)$/i.test(file))
                .map(archivo => path.join('/uploads', carpeta, archivo));

            return {
                nombre: carpeta,
                archivos: archivos
            };
        });

        res.json(salidaArchivos);
    });
});

// Ruta para servir el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configurar el puerto
app.listen(5000, () => {
    console.log('Servidor en http://localhost:5000');
});
