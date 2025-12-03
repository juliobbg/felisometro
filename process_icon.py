from PIL import Image, ImageDraw
import os

# Ruta de la imagen original (deberás guardar tu imagen como 'original_icon.png')
input_path = 'original_icon.png'
output_dir = 'assets/images'

def create_rounded_icon(size, output_name):
    """Crea un icono con esquinas redondeadas"""
    # Abrir imagen original
    img = Image.open(input_path).convert('RGBA')

    # Redimensionar manteniendo aspecto
    img = img.resize((size, size), Image.Resampling.LANCZOS)

    # Crear máscara con esquinas redondeadas
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)

    # Radio de las esquinas (aproximadamente 22.37% del tamaño según estándar de iOS)
    radius = int(size * 0.2237)

    # Dibujar rectángulo redondeado
    draw.rounded_rectangle([(0, 0), (size, size)], radius=radius, fill=255)

    # Aplicar máscara
    output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    output.paste(img, (0, 0))
    output.putalpha(mask)

    # Guardar
    output_path = os.path.join(output_dir, output_name)
    output.save(output_path, 'PNG')
    print(f'✓ Creado: {output_path}')

def create_adaptive_icon_parts(size):
    """Crea las partes del adaptive icon de Android"""
    # Abrir imagen original
    img = Image.open(input_path).convert('RGBA')
    img = img.resize((size, size), Image.Resampling.LANCZOS)

    # Foreground: la imagen completa pero más pequeña (área segura)
    # El área segura es 432x432 dentro de 1024x1024 (66 píxeles de margen)
    safe_area_size = int(size * 0.66)  # 66% del tamaño total
    margin = (size - safe_area_size) // 2

    foreground = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    img_resized = img.resize((safe_area_size, safe_area_size), Image.Resampling.LANCZOS)
    foreground.paste(img_resized, (margin, margin), img_resized)
    foreground.save(os.path.join(output_dir, 'android-icon-foreground.png'), 'PNG')
    print(f'✓ Creado: android-icon-foreground.png')

    # Background: color sólido (naranja del fondo del emoji)
    background = Image.new('RGBA', (size, size), '#FF9C00')
    background.save(os.path.join(output_dir, 'android-icon-background.png'), 'PNG')
    print(f'✓ Creado: android-icon-background.png')

    # Monochrome: versión en blanco del emoji
    monochrome = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    # Convertir a escala de grises y luego a blanco
    img_gray = img.convert('L')
    img_white = Image.new('RGBA', img.size, (255, 255, 255, 0))
    for x in range(img.width):
        for y in range(img.height):
            alpha = img.getpixel((x, y))[3] if img.mode == 'RGBA' else 255
            img_white.putpixel((x, y), (255, 255, 255, alpha))

    img_white_resized = img_white.resize((safe_area_size, safe_area_size), Image.Resampling.LANCZOS)
    monochrome.paste(img_white_resized, (margin, margin), img_white_resized)
    monochrome.save(os.path.join(output_dir, 'android-icon-monochrome.png'), 'PNG')
    print(f'✓ Creado: android-icon-monochrome.png')

def main():
    if not os.path.exists(input_path):
        print(f'❌ Error: No se encuentra {input_path}')
        print('Por favor, guarda tu imagen como "original_icon.png" en la raíz del proyecto')
        return

    print('🎨 Procesando iconos...\n')

    # Icono principal (iOS/general) - 1024x1024
    create_rounded_icon(1024, 'icon.png')

    # Adaptive icon para Android - 1024x1024
    create_adaptive_icon_parts(1024)

    # Favicon - 48x48
    create_rounded_icon(48, 'favicon.png')

    print('\n✅ ¡Todos los iconos han sido generados exitosamente!')
    print('\nAhora puedes recompilar la app con: npx eas build --platform android --profile preview')

if __name__ == '__main__':
    main()
