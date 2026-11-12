/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Paleta oficial do Manual de Marca Literacats (pág. 19)
      colors: {
        rosa: '#EE79A0', // Rosa Literacats
        pantufa: '#F4A8C7', // Rosa Pantufa
        scar: '#B01B34', // Vermelho Scar
        preto: '#1A1A19', // Gato Preto
        novelo: '#ECEBE1', // Branco Novelo
        // Texto secundário: não está no manual, mas é o preto clareado o mínimo
        // para manter contraste AA sobre o Novelo (~7:1)
        'preto-suave': '#4A4A48',
      },
      // Fontes oficiais primeiro: quando os arquivos licenciados entrarem via
      // @font-face, elas assumem sozinhas. Até lá valem as substitutas do Google Fonts.
      fontFamily: {
        display: ['Gobold', '"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['"Ariana Pro"', 'Outfit', 'system-ui', 'sans-serif'],
        script: ['"Filmotype Lucky"', '"Kaushan Script"', 'cursive'],
      },
    },
  },
  plugins: [],
}
