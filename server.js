const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Servir la carpeta 'uploads' como estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de multer para almacenar las imágenes en carpetas con fecha y nombre
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get values using the field names from the form
        const fecha = req.body.salidaFecha;
        const nombre = req.body.salidaNombre;
        
        // Debug logs
        console.log("Form data received:", req.body);
        console.log("Fecha:", fecha, "Nombre:", nombre);
        
        const folderName = `${fecha}_${nombre}`;
        const dir = path.join(__dirname, 'uploads', folderName);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using timestamp
        const uniqueSuffix = Date.now();
        const extension = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${extension}`);
    }
});

// Configuración para subir archivos a una carpeta existente
const storageExistente = multer.diskStorage({
    destination: (req, file, cb) => {
        const carpetaExistente = req.body.albumExistente;
        
        if (!carpetaExistente) {
            return cb(new Error('No se ha especificado un álbum existente'));
        }
        
        const dir = path.join(__dirname, 'uploads', carpetaExistente);
        
        if (!fs.existsSync(dir)) {
            return cb(new Error('La carpeta especificada no existe'));
        }
        
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using timestamp
        const uniqueSuffix = Date.now();
        const extension = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${extension}`);
    }
});

// Configurar middleware para parsear JSON
app.use(express.json());

const upload = multer({ storage: storage });

// Configurar multer específico para cada ruta
// Multer para nuevas fotos
const uploadNuevo = multer({
    storage: storage
}).array('fotos');

// Multer para fotos adicionales
const uploadExistente = multer({
    storage: storageExistente
}).array('fotosAdicionales');

// Ruta para subir fotos a un nuevo álbum
app.post('/api/subir', (req, res) => {
    uploadNuevo(req, res, function(err) {
        if (err) {
            console.error('Error en Multer:', err);
            return res.status(500).json({ error: err.message });
        }
        
        try {
            // Opcional: guardar información en un archivo de base de datos
            const albumInfo = {
                nombre: req.body.salidaNombre,
                fecha: req.body.salidaFecha,
                fotos: req.files.map(file => path.join('/uploads', `${req.body.salidaFecha}_${req.body.salidaNombre}`, file.filename))
            };
            
            // Actualizar o guardar en el registro de álbumes si lo deseas
            // saveAlbumInfo(albumInfo);
            
            res.json({ message: 'Fotos subidas correctamente', album: albumInfo });
        } catch (error) {
            console.error('Error al subir fotos:', error);
            res.status(500).json({ error: 'Error al subir fotos' });
        }
    });
});

// Ruta para añadir fotos a un álbum existente
app.post('/api/editar', (req, res) => {
    uploadExistente(req, res, function(err) {
        if (err) {
            console.error('Error en Multer:', err);
            return res.status(500).json({ error: err.message });
        }
        
        try {
            const carpetaExistente = req.body.albumExistente;
            
            // Obtener la lista de nuevas fotos subidas
            const nuevasFotos = req.files.map(file => path.join('/uploads', carpetaExistente, file.filename));
            
            res.json({ 
                message: 'Álbum actualizado correctamente',
                carpeta: carpetaExistente,
                nuevasFotos: nuevasFotos
            });
        } catch (error) {
            console.error('Error al actualizar álbum:', error);
            res.status(500).json({ error: 'Error al actualizar álbum' });
        }
    });
});

// Ruta para eliminar una foto de un álbum
app.post('/api/eliminar-foto', (req, res) => {
    try {
        const { carpeta, rutaFoto } = req.body;
        
        if (!carpeta || !rutaFoto) {
            return res.status(400).json({ error: 'Faltan parámetros necesarios' });
        }
        
        // Extraer solo el nombre del archivo de la ruta
        const nombreArchivo = path.basename(rutaFoto);
        const rutaCompleta = path.join(__dirname, 'uploads', carpeta, nombreArchivo);
        
        console.log('Intentando eliminar:', rutaCompleta);
        
        // Verificar si el archivo existe
        if (!fs.existsSync(rutaCompleta)) {
            return res.status(404).json({ error: 'El archivo no existe' });
        }
        
        // Eliminar el archivo
        fs.unlinkSync(rutaCompleta);
        
        res.json({ message: 'Archivo eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar foto:', error);
        res.status(500).json({ error: 'Error al eliminar foto' });
    }
});

// Ruta para obtener la lista de álbumes disponibles
app.get('/api/albumes', (req, res) => {
    try {
        const uploadsDir = path.join(__dirname, 'uploads');
        
        // Crear el directorio si no existe
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            return res.json([]);
        }
        
        const carpetas = fs.readdirSync(uploadsDir)
            .filter(item => fs.lstatSync(path.join(uploadsDir, item)).isDirectory());
            
        const albumesList = carpetas.map(carpeta => {
            return {
                carpeta: carpeta
            };
        });
        
        res.json(albumesList);
    } catch (error) {
        console.error('Error al obtener lista de álbumes:', error);
        res.status(500).json({ error: 'Error al obtener lista de álbumes' });
    }
});

// Ruta para obtener las carpetas y archivos dentro de uploads
app.get('/api/salidas', (req, res) => {
    fs.readdir('uploads', (err, folders) => {
        if (err) {
            return res.status(500).json({ error: 'No se pueden leer las carpetas' });
        }

        const carpetas = folders.filter(folder => fs.lstatSync(path.join('uploads', folder)).isDirectory());
        const salidaArchivos = carpetas.map(carpeta => {
            const archivos = fs.readdirSync(path.join('uploads', carpeta))
                .filter(file => /\.(jpg|jpeg|png|gif|mp4)$/i.test(file)) // Incluir videos .mp4
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
