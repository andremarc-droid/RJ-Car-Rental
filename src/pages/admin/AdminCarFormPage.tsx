import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createCar, fetchCarById, updateCar } from '../../services/firestore';

import type { CarFormData, CarStatus, Transmission } from '../../types';
import { CAR_CATEGORIES, FUEL_TYPES } from '../../types';

type ImageFile = File;



const convertToBase64 = (file: ImageFile): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Downscale image dimensions if it's very large
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get 2D context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress image using jpeg format and iterative quality adjustment
        let quality = 0.8;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Keep document size under 800KB (base64 length * 0.75 represents byte size)
        while (dataUrl.length * 0.75 > 800000 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};


const defaultForm: CarFormData = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  category: 'Sedan',
  seats: 5,
  transmission: 'automatic',
  fuel_type: 'Gasoline',
  daily_rate: 0,
  status: 'available',
  available_from: '',
  available_until: '',
  description: '',
};

export default function AdminCarFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<CarFormData>(defaultForm);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchCarById(id).then((car) => {
      if (car) {
        setForm({
          brand: car.brand,
          model: car.model,
          year: car.year,
          category: car.category,
          seats: car.seats,
          transmission: car.transmission,
          fuel_type: car.fuel_type,
          daily_rate: car.daily_rate,
          status: car.status,
          available_from: car.available_from ?? '',
          available_until: car.available_until ?? '',
          description: car.description ?? '',
          image_url: car.image_url,
        });
        if (car.image_url) setPreview(car.image_url);
      }
      setLoading(false);
    });
  }, [id]);

  const updateField = <K extends keyof CarFormData>(key: K, value: CarFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { getAuth } = await import('firebase/auth');
    const currentUser = getAuth().currentUser;
    console.log('Current user:', currentUser?.email, currentUser?.uid);
    if (!currentUser) {
      alert('You must be logged in to perform this action.');
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = form.image_url;

      // If user selected a new image, convert it to base64 and store directly in Firestore.
      if (imageFile) {
        imageUrl = await convertToBase64(imageFile);
      }

      // If no new image is selected (edit mode), keep existing image_url unchanged.
      const payload = { ...form, image_url: imageUrl };


      if (isEdit && id) {
        await updateCar(id, payload);
      } else {
        await createCar(payload);
      }
      navigate('/admin/cars');
    } catch {
      alert('Failed to save vehicle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-gray-500">Loading vehicle...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-semibold text-xl text-navy">{isEdit ? 'Edit Fleet Vehicle' : 'Add New Fleet Vehicle'}</h2>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-150 rounded-2xl p-8 space-y-6 shadow-sm" aria-label={isEdit ? 'Edit car form' : 'Add car form'}>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Brand / Manufacturer</label>
            <input required value={form.brand} onChange={(e) => updateField('brand', e.target.value)} className="premium-input bg-gray-50" placeholder="e.g. Toyota" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Model Name</label>
            <input required value={form.model} onChange={(e) => updateField('model', e.target.value)} className="premium-input bg-gray-50" placeholder="e.g. Vios" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Release Year</label>
            <input required type="number" value={form.year} onChange={(e) => updateField('year', parseInt(e.target.value, 10))} className="premium-input bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category</label>
            <select value={form.category} onChange={(e) => updateField('category', e.target.value)} className="premium-input bg-gray-50">
              {CAR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Seats Capacity</label>
            <input required type="number" min={1} value={form.seats} onChange={(e) => updateField('seats', parseInt(e.target.value, 10))} className="premium-input bg-gray-50" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Transmission</label>
            <select value={form.transmission} onChange={(e) => updateField('transmission', e.target.value as Transmission)} className="premium-input bg-gray-50">
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Fuel Type</label>
            <select value={form.fuel_type} onChange={(e) => updateField('fuel_type', e.target.value)} className="premium-input bg-gray-50">
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Daily Price (₱)</label>
            <input required type="number" step="0.01" min={0} value={form.daily_rate || ''} onChange={(e) => updateField('daily_rate', parseFloat(e.target.value))} className="premium-input bg-gray-50" />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
          <h3 className="text-sm font-black text-navy uppercase tracking-wider">Availability Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Status</label>
              <select value={form.status} onChange={(e) => updateField('status', e.target.value as CarStatus)} className="premium-input bg-white">
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Available From</label>
              <input type="date" value={form.available_from} onChange={(e) => updateField('available_from', e.target.value)} className="premium-input bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Available Until</label>
              <input type="date" value={form.available_until} onChange={(e) => updateField('available_until', e.target.value)} className="premium-input bg-white" />
            </div>
          </div>
          <p className="text-xs text-gray-400 italic">Leave dates blank if the car is available indefinitely</p>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Vehicle Photo</label>
          <div className="relative w-full h-56 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                <button type="button" onClick={() => { setPreview(null); setImageFile(null); updateField('image_url', ''); }} className="absolute top-3 right-3 h-8 w-8 bg-rose-500 text-white rounded-full flex items-center justify-center">×</button>
              </>
            ) : (
              <span className="text-xs font-semibold uppercase text-gray-400">No image selected</span>
            )}
          </div>
          <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-600 cursor-pointer">
            Upload File
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Vehicle Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} className="premium-input bg-gray-50" placeholder="Brief details about the vehicle..." />
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-150">
          <Link to="/admin/cars" className="flex-1 py-3 text-center border border-gray-200 rounded-xl text-gray-500 font-bold hover:bg-gray-50">Back to Fleet</Link>
          <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold shadow-md disabled:opacity-50">
            {submitting ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Add to Fleet'}
          </button>
        </div>
      </form>
    </div>
  );
}
