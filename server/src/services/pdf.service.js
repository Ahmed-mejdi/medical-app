const PDFDocument = require('pdfkit');

function buildPrescriptionPDF(dataCallback, endCallback, prescriptionData) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    // Destructure data for easier access
    const {
        prescription_id,
        professional_first_name, professional_last_name, specialty,
        patient_first_name, patient_last_name, date_of_birth,
        medication_name, dosage, instructions, issued_date
    } = prescriptionData;

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('Ordonnance Médicale', { align: 'center' });
    doc.moveDown();

    // Professional Info
    doc.fontSize(12).font('Helvetica-Bold').text('Dr. ' + professional_first_name + ' ' + professional_last_name);
    doc.font('Helvetica').text(specialty || 'Médecine Générale');
    doc.moveDown();

    // Patient Info
    doc.fontSize(12).font('Helvetica-Bold').text('Patient:');
    doc.font('Helvetica').text(`${patient_first_name} ${patient_last_name}`);
    doc.text(`Date de Naissance: ${new Date(date_of_birth).toLocaleDateString('fr-FR')}`);
    doc.moveDown();

    // Prescription Details
    doc.rect(50, doc.y, doc.page.width - 100, 1).fillColor('black').stroke();
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text('Prescription:');
    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica-Bold').text(medication_name);
    doc.font('Helvetica').text(`Dosage: ${dosage}`);
    if (instructions) {
        doc.font('Helvetica').text(`Instructions: ${instructions}`);
    }
    doc.moveDown();
    
    // Footer
    doc.fontSize(10).font('Helvetica-Oblique')
       .text(`Fait le ${new Date(issued_date).toLocaleDateString('fr-FR')} | Ordonnance N°: ${prescription_id}`, 
       { align: 'right' });

    doc.end();
}

module.exports = { buildPrescriptionPDF };