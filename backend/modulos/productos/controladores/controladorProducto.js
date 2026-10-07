// backend/modulos/productos/controladores/controladorProducto.js (CORREGIDO)
import ModeloProducto from '../modelos/modeloProducto.js';
import mongoose from 'mongoose';

// Helper para obtener URL completa de imagen
const getImagenUrlCompleta = (imagenUrl) => {
  if (!imagenUrl) return null;
  if (imagenUrl.startsWith('http')) return imagenUrl;
  return `http://localhost:5000${imagenUrl}`;
};

export const crearProducto = async (req, res) => {
  try {
    console.log('📸 Archivo recibido:', req.file); // Debug
    console.log('📦 Datos recibidos:', req.body); // Debug
    
    const datosProducto = JSON.parse(JSON.stringify(req.body));
    
    // Si hay imagen subida, guardar la ruta
    if (req.file) {
      datosProducto.imagenUrl = `/uploads/${req.file.filename}`;
      console.log('✅ Imagen guardada en:', datosProducto.imagenUrl);
    }
    
    const producto = new ModeloProducto(datosProducto);
    await producto.save();
    
    // Devolver producto con URL completa
    const productoRespuesta = producto.toObject();
    productoRespuesta.imagenUrlCompleta = getImagenUrlCompleta(producto.imagenUrl);
    
    res.status(201).json({ 
      mensaje: 'Producto creado exitosamente', 
      producto: productoRespuesta 
    });
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    res.status(400).json({ error: 'error_crear_producto', mensaje: error.message });
  }
};

export const obtenerProductos = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, categoria, activo, busqueda } = req.query;
    const filtro = {};
    
    if (categoria) filtro.categoria = categoria;
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (busqueda) {
      filtro.$text = { $search: busqueda };
    }
    
    const productos = await ModeloProducto.find(filtro)
      .limit(limite * 1)
      .skip((pagina - 1) * limite)
      .sort({ createdAt: -1 });
    
    const total = await ModeloProducto.countDocuments(filtro);
    
    // Agregar URL completa de imagen a cada producto
    const productosConUrl = productos.map(producto => {
      const obj = producto.toObject();
      obj.imagenUrlCompleta = getImagenUrlCompleta(producto.imagenUrl);
      return obj;
    });
    
    res.json({
      productos: productosConUrl,
      paginaActual: parseInt(pagina),
      totalPaginas: Math.ceil(total / limite),
      totalProductos: total
    });
  } catch (error) {
    console.error('Error en obtenerProductos:', error);
    res.status(500).json({ error: 'error_obtener_productos', mensaje: error.message });
  }
};

export const obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await ModeloProducto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'producto_no_encontrado', mensaje: 'Producto no encontrado' });
    }
    
    const productoRespuesta = producto.toObject();
    productoRespuesta.imagenUrlCompleta = getImagenUrlCompleta(producto.imagenUrl);
    
    res.json(productoRespuesta);
  } catch (error) {
    res.status(500).json({ error: 'error_obtener_producto', mensaje: error.message });
  }
};

export const actualizarProducto = async (req, res) => {
  try {
    console.log('📸 Archivo recibido para edición:', req.file);
    console.log('📦 Datos de edición:', req.body);
    
    const datosActualizar = JSON.parse(JSON.stringify(req.body));
    
    // Si hay nueva imagen, actualizar la ruta
    if (req.file) {
      datosActualizar.imagenUrl = `/uploads/${req.file.filename}`;
      console.log('✅ Imagen actualizada en:', datosActualizar.imagenUrl);
    }
    
    const producto = await ModeloProducto.findByIdAndUpdate(
      req.params.id,
      datosActualizar,
      { new: true, runValidators: true }
    );
    
    if (!producto) {
      return res.status(404).json({ error: 'producto_no_encontrado', mensaje: 'Producto no encontrado' });
    }
    
    const productoRespuesta = producto.toObject();
    productoRespuesta.imagenUrlCompleta = getImagenUrlCompleta(producto.imagenUrl);
    
    res.json({ mensaje: 'Producto actualizado exitosamente', producto: productoRespuesta });
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    res.status(400).json({ error: 'error_actualizar_producto', mensaje: error.message });
  }
};

// Mantener el resto de funciones existentes (eliminarProducto, etc.)
export const eliminarProducto = async (req, res) => {
  try {
    const producto = await ModeloProducto.findByIdAndDelete(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'producto_no_encontrado', mensaje: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'error_eliminar_producto', mensaje: error.message });
  }
};

export const actualizarStockVitrina = async (req, res) => {
  try {
    const { cantidad, operacion } = req.body;
    const producto = await ModeloProducto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ error: 'producto_no_encontrado', mensaje: 'Producto no encontrado' });
    }
    
    if (operacion === 'aumentar') {
      producto.stockVitrina += cantidad;
      await producto.save();
    } else if (operacion === 'reducir') {
      await producto.reducirStockVitrina(cantidad);
    } else {
      return res.status(400).json({ error: 'operacion_invalida', mensaje: 'Operación debe ser "aumentar" o "reducir"' });
    }
    
    res.json({ mensaje: 'Stock en vitrina actualizado', stockVitrina: producto.stockVitrina });
  } catch (error) {
    res.status(400).json({ error: 'error_actualizar_stock', mensaje: error.message });
  }
};

export const actualizarStockAlmacen = async (req, res) => {
  try {
    const { cantidad, operacion } = req.body;
    const producto = await ModeloProducto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ error: 'producto_no_encontrado', mensaje: 'Producto no encontrado' });
    }
    
    if (operacion === 'aumentar') {
      await producto.aumentarStockAlmacen(cantidad);
    } else if (operacion === 'reducir') {
      await producto.reducirStockAlmacen(cantidad);
    } else {
      return res.status(400).json({ error: 'operacion_invalida', mensaje: 'Operación debe ser "aumentar" o "reducir"' });
    }
    
    res.json({ mensaje: 'Stock en almacén actualizado', stockAlmacen: producto.stockAlmacen });
  } catch (error) {
    res.status(400).json({ error: 'error_actualizar_stock', mensaje: error.message });
  }
};

export const reabastecerVitrina = async (req, res) => {
  try {
    const { cantidad } = req.body;
    const producto = await ModeloProducto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ error: 'producto_no_encontrado', mensaje: 'Producto no encontrado' });
    }
    
    await producto.reabastecerVitrina(cantidad);
    
    res.json({ 
      mensaje: 'Vitrina reabastecida exitosamente', 
      stockVitrina: producto.stockVitrina,
      stockAlmacen: producto.stockAlmacen
    });
  } catch (error) {
    res.status(400).json({ error: 'error_reabastecer', mensaje: error.message });
  }
};

export const obtenerAlertasStockBajo = async (req, res) => {
  try {
    const productos = await ModeloProducto.find({
      stockVitrina: { $lte: mongoose.Types.Document.prototype.stockMinimoVitrina },
      activo: true
    });
    
    res.json({ 
      alertas: productos.map(p => ({
        id: p._id,
        nombre: p.nombre,
        stockVitrina: p.stockVitrina,
        stockMinimo: p.stockMinimoVitrina,
        stockAlmacen: p.stockAlmacen
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'error_obtener_alertas', mensaje: error.message });
  }
};