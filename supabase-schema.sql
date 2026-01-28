-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_kz TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Places table
CREATE TABLE places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  working_hours TEXT,
  photos TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  date_start TIMESTAMP WITH TIME ZONE NOT NULL,
  date_end TIMESTAMP WITH TIME ZONE NOT NULL,
  price INTEGER,
  ticket_url TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_places_category ON places(category_id);
CREATE INDEX idx_places_featured ON places(is_featured);
CREATE INDEX idx_events_place ON events(place_id);
CREATE INDEX idx_events_date ON events(date_start);

-- Enable Row Level Security (optional, for public read access)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON places FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON events FOR SELECT USING (true);

-- Insert categories
INSERT INTO categories (id, name, name_kz, icon, color) VALUES
(1, 'Активный отдых', 'Белсенді демалыс', '🏔️', '#10B981'),
(2, 'Рестораны и кафе', 'Мейрамханалар мен кафелер', '🍽️', '#F59E0B'),
(3, 'Бары и клубы', 'Барлар мен клубтар', '🍸', '#8B5CF6'),
(4, 'Культура', 'Мәдениет', '🎭', '#EC4899'),
(5, 'Спорт', 'Спорт', '⚽', '#3B82F6'),
(6, 'Детям', 'Балаларға', '🎈', '#F97316'),
(7, 'Природа', 'Табиғат', '🌲', '#22C55E');

-- Insert test places
INSERT INTO places (name, description, category_id, latitude, longitude, address, phone, working_hours, photos, is_featured) VALUES
('Медеу', 'Высокогорный спортивный комплекс с крупнейшим в мире катком с естественным льдом. Расположен на высоте 1691 метр над уровнем моря в урочище Медеу.', 1, 43.1567, 77.0586, 'Горная ул., Медеу', '+7 727 386 86 86', '10:00-22:00', ARRAY['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800'], true),
('Шымбулак', 'Горнолыжный курорт международного класса. Трассы различной сложности, современные подъёмники, рестораны и отели.', 1, 43.1251, 77.0792, 'Керей, Жанибек хандар 640', '+7 727 330 88 88', '09:00-17:00', ARRAY['https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800'], true),
('Кок-Тобе', 'Парк развлечений на вершине горы с панорамным видом на город. Канатная дорога, аттракционы, рестораны и знаменитая телебашня.', 7, 43.2279, 76.9840, 'Кок-Тобе', '+7 727 273 01 01', '10:00-00:00', ARRAY['https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800'], true),
('Парк 28 панфиловцев', 'Центральный парк города с Вознесенским собором, мемориалом Славы и музеем музыкальных инструментов. Излюбленное место отдыха горожан.', 7, 43.2580, 76.9575, 'ул. Гоголя, 40', NULL, 'Круглосуточно', ARRAY['https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=800'], false),
('ГАТОБ им. Абая', 'Государственный академический театр оперы и балета. Один из крупнейших театров Центральной Азии с богатым репертуаром.', 4, 43.2432, 76.9452, 'пр. Кабанбай батыра, 110', '+7 727 272 79 34', '10:00-19:00', ARRAY['https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800'], true),
('Arbat Bar', 'Атмосферный бар в центре города с живой музыкой, авторскими коктейлями и широким выбором закусок.', 3, 43.2387, 76.9456, 'ул. Панфилова, 100', '+7 727 273 54 54', '18:00-02:00', ARRAY['https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800'], false),
('Каганат', 'Ресторан казахской национальной кухни в современной интерпретации. Уютная атмосфера и аутентичные блюда.', 2, 43.2365, 76.9512, 'ул. Тулебаева, 85', '+7 727 261 00 00', '11:00-23:00', ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'], false),
('Falcon Club', 'Один из крупнейших ночных клубов Алматы с несколькими танцполами, VIP-зонами и выступлениями мировых диджеев.', 3, 43.2341, 76.9234, 'пр. Достык, 210', '+7 727 264 33 33', '22:00-06:00', ARRAY['https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800'], false),
('Центральный стадион', 'Главная спортивная арена города. Домашний стадион футбольного клуба Кайрат. Вместимость 23 000 зрителей.', 5, 43.2298, 76.9301, 'ул. Сатпаева, 29/3', '+7 727 292 01 01', 'По расписанию матчей', ARRAY['https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800'], false),
('Алматинский зоопарк', 'Один из старейших зоопарков Казахстана с более чем 500 видами животных. Отличное место для семейного отдыха с детьми.', 6, 43.2456, 76.9234, 'ул. Есенберлина, 166', '+7 727 261 56 17', '09:00-20:00', ARRAY['https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800'], true);

-- Insert sample events
INSERT INTO events (place_id, name, description, date_start, date_end, price, ticket_url, photos) VALUES
((SELECT id FROM places WHERE name = 'ГАТОБ им. Абая'), 'Лебединое озеро', 'Классический балет П.И. Чайковского в исполнении труппы театра', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '3 hours', 5000, 'https://tickets.kz', ARRAY['https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800']),
((SELECT id FROM places WHERE name = 'Falcon Club'), 'DJ Snake Live', 'Выступление всемирно известного диджея', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '6 hours', 15000, 'https://tickets.kz', ARRAY['https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800']),
((SELECT id FROM places WHERE name = 'Медеу'), 'Ночное катание', 'Катание на коньках под звёздным небом с музыкой и подсветкой', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '4 hours', 2000, NULL, ARRAY['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800']),
((SELECT id FROM places WHERE name = 'Центральный стадион'), 'Кайрат - Астана', 'Матч чемпионата Казахстана по футболу', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '2 hours', 3000, 'https://tickets.kz', ARRAY['https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800']),
((SELECT id FROM places WHERE name = 'Кок-Тобе'), 'Фестиваль еды', 'Гастрономический фестиваль с участием лучших ресторанов города', NOW() + INTERVAL '7 days', NOW() + INTERVAL '8 days', NULL, NULL, ARRAY['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800']);
