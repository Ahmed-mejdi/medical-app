-- Create a database named "mediconnect" if it doesn't exist
-- CREATE DATABASE mediconnect;

-- Users table (Core user information)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'professional', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patients table (Extends users table for patient-specific data)
CREATE TABLE patients (
    patient_user_id INT PRIMARY KEY REFERENCES users(user_id),
    date_of_birth DATE,
    address TEXT,
    phone_number VARCHAR(20)
);

-- Professionals table (Extends users table for professional-specific data)
CREATE TABLE professionals (
    professional_user_id INT PRIMARY KEY REFERENCES users(user_id),
    specialty VARCHAR(100), -- e.g., Cardiologist, General Practitioner
    license_number VARCHAR(100) UNIQUE
);

-- Linking table for the many-to-many relationship between professionals and patients
CREATE TABLE professional_patient_map (
    map_id SERIAL PRIMARY KEY,
    professional_id INT NOT NULL REFERENCES professionals(professional_user_id),
    patient_id INT NOT NULL REFERENCES patients(patient_user_id),
    UNIQUE(professional_id, patient_id) -- Ensures a professional can only be linked to a patient once
);

-- Appointments table
CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    professional_id INT NOT NULL REFERENCES professionals(professional_user_id),
    patient_id INT NOT NULL REFERENCES patients(patient_user_id),
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table to group messages between a patient and a professional
CREATE TABLE conversations (
    conversation_id SERIAL PRIMARY KEY,
    professional_id INT NOT NULL REFERENCES professionals(professional_user_id),
    patient_id INT NOT NULL REFERENCES patients(patient_user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(professional_id, patient_id)
);

-- Messages table
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL REFERENCES conversations(conversation_id),
    sender_id INT NOT NULL REFERENCES users(user_id),
    receiver_id INT NOT NULL REFERENCES users(user_id),
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions table
CREATE TABLE prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    professional_id INT NOT NULL REFERENCES professionals(professional_user_id),
    patient_id INT NOT NULL REFERENCES patients(patient_user_id),
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    instructions TEXT,
    issued_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Example Insertion (run this manually after creating tables to test)
/*
-- 1. Create a user who is a professional
INSERT INTO users (email, password_hash, role, first_name, last_name) 
VALUES ('doctor.house@example.com', 'hashed_password', 'professional', 'Gregory', 'House');
-- 2. Add professional-specific details
INSERT INTO professionals (professional_user_id, specialty, license_number)
VALUES ((SELECT user_id FROM users WHERE email='doctor.house@example.com'), 'Diagnostic Medicine', 'MD12345');

-- 3. Create a user who is a patient
INSERT INTO users (email, password_hash, role, first_name, last_name) 
VALUES ('john.doe@example.com', 'hashed_password', 'patient', 'John', 'Doe');
-- 4. Add patient-specific details
INSERT INTO patients (patient_user_id, date_of_birth, address)
VALUES ((SELECT user_id FROM users WHERE email='john.doe@example.com'), '1985-01-15', '123 Fake Street');

-- 5. Link Dr. House to his patient John Doe
INSERT INTO professional_patient_map (professional_id, patient_id)
VALUES (
    (SELECT professional_user_id FROM professionals WHERE license_number='MD12345'),
    (SELECT patient_user_id FROM patients WHERE date_of_birth='1985-01-15')
);

-- 6. Create an appointment
INSERT INTO appointments (professional_id, patient_id, appointment_date, reason)
VALUES (
    (SELECT professional_user_id FROM professionals WHERE license_number='MD12345'),
    (SELECT patient_user_id FROM patients WHERE date_of_birth='1985-01-15'),
    '2024-06-15 10:00:00+00',
    'Consultation de suivi'
);
*/

-- You can add more tables here as the project grows.
-- For example: patients, professionals, appointments, etc.
-- Example for a patients table that links to the users table:
/*
CREATE TABLE patients (
    patient_id INT PRIMARY KEY REFERENCES users(user_id),
    date_of_birth DATE,
    address TEXT,
    phone_number VARCHAR(20)
);
*/ 