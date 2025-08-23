import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for reaching out. We'll get back to you soon!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-navy mb-6">Contact Us</h1>

      {/* Contact Form */}
      <div className="bg-blanc shadow-lg rounded-lg p-6 mb-12">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required />
          </div>
          <Button type="submit" className="bg-navy text-blanc hover:bg-teal">
            Send Message
          </Button>
        </form>
      </div>

      {/* Trade Team */}
      <div className="bg-foam shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-navy mb-4">Trade Team</h2>
        <p className="text-navy font-semibold">📞 Jaryd: <span className="font-normal">+27 83 607 7670</span></p>
        <p className="text-navy font-semibold">📞 Christelle: <span className="font-normal">+27 74 904 3765</span></p>
      </div>

      {/* Complaints */}
      <div className="bg-foam shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-navy mb-4">Complaints</h2>
        <p className="text-navy">
          Please direct all complaints to <strong>Tiffany Miller</strong> at:
        </p>
        <p className="mt-2 font-semibold text-teal">
          <a href="mailto:Tiffany.Miller@liquidcurrent.co.za" className="hover:underline">
            Tiffany.Miller@liquidcurrent.co.za
          </a>
        </p>
      </div>
    </div>
  );
}
