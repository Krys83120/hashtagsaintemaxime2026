insert into links (label, url, icon, active, type, sort_order) values
  ('Boutique', '/boutique/', 'store', true, 'header', 0),
  ('La Marque', '/la-marque/', 'info', true, 'header', 1),
  ('Le Cœur au Sol', '/le-coeur-au-sol/', 'heart', true, 'header', 2),
  ('Instagram', 'https://www.instagram.com/hashtag_saintemaxime/', 'instagram', true, 'social', 0),
  ('Facebook', 'https://www.facebook.com/hashtagsaintemaxime/', 'facebook', true, 'social', 1),
  ('TikTok', 'https://www.tiktok.com/@hashtagsaintemaxime', 'tiktok', true, 'social', 2),
  ('Email', 'mailto:contact@hashtagsaintemaxime.fr', 'mail', true, 'contact', 0),
  ('Mentions légales', '/mentions-legales/', 'file', true, 'legal', 0),
  ('CGV', '/cgv/', 'file', true, 'legal', 1),
  ('Politique de confidentialité', '/confidentialite/', 'file', true, 'legal', 2),
  ('Livraison & Retours', '/livraison/', 'truck', true, 'footer', 0),
  ('Guide des tailles', '/guide-tailles/', 'ruler', true, 'footer', 1)
on conflict do nothing;
