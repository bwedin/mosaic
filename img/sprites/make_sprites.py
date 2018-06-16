from PIL import Image


layers = ['mixed3a','mixed4a','mixed4d','mixed5a']
sprite_size = 110;

for layer in layers:
	n = 0;
	spritemap_img = Image.open(layer+ '.jpeg')
	w, h = img.size
	# for i in range(w/110):
	# 	for j in range(h/110):
	for i in range(3):
		for j in range(3):
			fname = layer+'/'+str(n)+'.jpeg'
			spritemap_img.crop((i*110, j*110, (i+1)*110, (j+1)*110)).save(fname,'JPEG')
			n += 1


img = Image.open('mixed3a.jpeg')