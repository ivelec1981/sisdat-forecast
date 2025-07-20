'use client'

import React from 'react';
import { BookOpen, FileText, Download, ExternalLink } from 'lucide-react';

export default function DocumentationTab() {
  const documents = [
    {
      title: 'Manual de Usuario SISDAT Forecast',
      description: 'Guía completa para el uso del sistema de predicción',
      type: 'PDF',
      size: '2.5 MB',
      date: '2024-01-15'
    },
    {
      title: 'Metodología de Modelos Predictivos',
      description: 'Documentación técnica sobre los algoritmos implementados',
      type: 'PDF',
      size: '4.1 MB',
      date: '2024-01-10'
    },
    {
      title: 'API Documentation',
      description: 'Referencia completa de la API REST',
      type: 'HTML',
      size: '1.8 MB',
      date: '2024-01-08'
    },
    {
      title: 'Reporte de Validación de Modelos',
      description: 'Análisis de precisión y validación cruzada',
      type: 'PDF',
      size: '3.2 MB',
      date: '2024-01-05'
    }
  ];

  const tutorials = [
    {
      title: 'Introducción al Dashboard',
      description: 'Conceptos básicos y navegación',
      duration: '5 min',
      level: 'Básico'
    },
    {
      title: 'Interpretación de Proyecciones',
      description: 'Cómo leer y analizar las predicciones',
      duration: '8 min',
      level: 'Intermedio'
    },
    {
      title: 'Configuración de Alertas',
      description: 'Personalizar notificaciones del sistema',
      duration: '6 min',
      level: 'Básico'
    },
    {
      title: 'Análisis Avanzado de Datos',
      description: 'Técnicas de análisis profundo',
      duration: '12 min',
      level: 'Avanzado'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Introducción */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Documentación SISDAT Forecast</h3>
        <p className="text-slate-600 mb-4">
          Bienvenido al sistema de documentación de SISDAT Forecast. Aquí encontrarás toda la información 
          necesaria para utilizar eficientemente el sistema de predicción de demanda eléctrica.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <BookOpen className="mx-auto text-blue-600 mb-2" size={32} />
            <h4 className="font-semibold text-slate-900">Guías de Usuario</h4>
            <p className="text-sm text-slate-600">Manuales paso a paso</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FileText className="mx-auto text-green-600 mb-2" size={32} />
            <h4 className="font-semibold text-slate-900">Documentación Técnica</h4>
            <p className="text-sm text-slate-600">Especificaciones y APIs</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <ExternalLink className="mx-auto text-yellow-600 mb-2" size={32} />
            <h4 className="font-semibold text-slate-900">Recursos Externos</h4>
            <p className="text-sm text-slate-600">Enlaces y referencias</p>
          </div>
        </div>
      </div>

      {/* Documentos disponibles */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Documentos Disponibles</h4>
        <div className="space-y-4">
          {documents.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex-1">
                <h5 className="font-medium text-slate-900">{doc.title}</h5>
                <p className="text-sm text-slate-600 mt-1">{doc.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                  <span>{doc.type}</span>
                  <span>{doc.size}</span>
                  <span>Actualizado: {doc.date}</span>
                </div>
              </div>
              <button className="ml-4 p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                <Download size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tutoriales */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Tutoriales Interactivos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutorials.map((tutorial, idx) => (
            <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-slate-900">{tutorial.title}</h5>
                  <p className="text-sm text-slate-600 mt-1">{tutorial.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tutorial.level === 'Básico' ? 'bg-green-100 text-green-800' :
                  tutorial.level === 'Intermedio' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {tutorial.level}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">{tutorial.duration}</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Iniciar Tutorial →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Preguntas Frecuentes</h4>
        <div className="space-y-4">
          {[
            {
              question: '¿Cómo se calculan las predicciones?',
              answer: 'Las predicciones se generan usando múltiples modelos de machine learning incluyendo Prophet, LSTM, GRU y BiLSTM, combinados con modelos econométricos tradicionales.'
            },
            {
              question: '¿Con qué frecuencia se actualizan los datos?',
              answer: 'Los datos se actualizan en tiempo real desde las fuentes de ARCONEL, con predicciones recalculadas cada hora.'
            },
            {
              question: '¿Qué precisión tienen los modelos?',
              answer: 'La precisión promedio del modelo Prophet es del 94.5%, variando según el sector y horizonte temporal de predicción.'
            },
            {
              question: '¿Cómo puedo exportar los datos?',
              answer: 'Puedes exportar datos en formato CSV, Excel o PDF desde cualquier gráfico usando el botón de exportación.'
            }
          ].map((faq, idx) => (
            <div key={idx} className="border-b border-slate-200 last:border-b-0 pb-4 last:pb-0">
              <h6 className="font-medium text-slate-900 mb-2">{faq.question}</h6>
              <p className="text-sm text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Información de contacto */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-2">¿Necesitas ayuda adicional?</h4>
        <p className="text-blue-800 mb-4">
          Nuestro equipo técnico está disponible para brindarte soporte especializado.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Contactar Soporte
          </button>
          <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
            Solicitar Capacitación
          </button>
        </div>
      </div>
    </div>
  );
}