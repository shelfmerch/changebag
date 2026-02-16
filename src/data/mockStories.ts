import { Story } from '@/models/Story';

// Sponsor-related stories - focused on business benefits, ROI, brand recognition
export const sponsorStories: Story[] = [
  {
    id: 'sponsor-1',
    title: 'How my sponsored bags helped a local shelter',
    authorName: 'Sarah Johnson',
    imageUrl: '/images/sponsor1.png',
    content: 'When I decided to sponsor 100 tote bags for the homeless shelter in my community, I had no idea what impact it would make. The shelter director told me that having quality, durable bags allowed many of their clients to carry their belongings with dignity. One woman even used her bag for job interviews, carrying her resume and a change of clothes. Three months later, she secured stable employment.',
    excerpt: 'When I decided to sponsor 100 tote bags for the homeless shelter in my community, I had no idea what impact it would make...',
    createdAt: new Date('2025-04-15'),
  },
  {
    id: 'sponsor-2',
    title: 'Small business, big impact',
    authorName: 'Taylor Williams',
    imageUrl: '/images/sponsor2.png',
    content: 'As a small coffee shop owner, I wasn\'t sure if sponsoring tote bags would be worth the investment. But seeing our brand carried around town by people who care about the same causes we do has been incredible marketing. We\'ve had new customers come in specifically because they saw our logo on a bag and looked us up. The ROI has exceeded our expectations!',
    excerpt: 'As a small coffee shop owner, I wasn\'t sure if sponsoring tote bags would be worth the investment. But seeing our brand carried around town...',
    createdAt: new Date('2025-04-22'),
  },
  {
    id: 'sponsor-3',
    title: 'Corporate sponsorship that actually works',
    authorName: 'Michael Chen',
    imageUrl: '/images/sponsor3.png',
    content: 'Our company sponsored 500 bags for an environmental initiative, and the employee engagement has been incredible. People are proud to carry these bags, and it\'s sparked conversations about sustainability in our workplace. We\'ve also received positive feedback from clients who appreciate our commitment to social responsibility.',
    excerpt: 'Our company sponsored 500 bags for an environmental initiative, and the employee engagement has been incredible...',
    createdAt: new Date('2025-05-10'),
  },
//   {
//     id: 'sponsor-4',
//     title: 'From skeptic to believer',
//     authorName: 'Jennifer Park',
//     imageUrl: '/stories/story1.png',
//     content: 'I was initially skeptical about sponsoring tote bags, but the transparency and impact tracking won me over. We can see exactly how our contribution is being used, and the regular updates show real change happening in communities. It\'s refreshing to work with a platform that actually delivers on its promises.',
//     excerpt: 'I was initially skeptical about sponsoring tote bags, but the transparency and impact tracking won me over...',
//     createdAt: new Date('2025-05-15'),
//   },
//   {
//     id: 'sponsor-5',
//     title: 'Building brand loyalty through purpose',
//     authorName: 'David Rodriguez',
//     imageUrl: '/stories/story3.png',
//     content: 'As a restaurant owner, sponsoring tote bags for a local food bank initiative has strengthened our connection with the community. Customers appreciate that we\'re giving back, and many have become regular patrons because they align with our values. The bags serve as walking advertisements for both our business and the cause.',
//     excerpt: 'As a restaurant owner, sponsoring tote bags for a local food bank initiative has strengthened our connection with the community...',
//     createdAt: new Date('2025-05-20'),
//   },
//   {
//     id: 'sponsor-6',
//     title: 'The unexpected benefits of cause sponsorship',
//     authorName: 'Emma Thompson',
//     imageUrl: '/stories/story2.png',
//     content: 'We sponsored bags for an educational initiative and discovered that our employees were more engaged at work. Many volunteered to help distribute the bags and got involved with the cause personally. This has improved our company culture and made our team feel more connected to our community.',
//     excerpt: 'We sponsored bags for an educational initiative and discovered that our employees were more engaged at work...',
//     createdAt: new Date('2025-05-25'),
//   }
];

// Claim-related stories - focused on personal impact, community, environmental benefits
export const claimStories: Story[] = [
  {
    id: 'claim-1',
    title: 'My eco-friendly journey with Changebag',
    authorName: 'Miguel Rodriguez',
    imageUrl: '/stories/story2.png',
    content: 'I claimed my first Changebag tote bag six months ago, and it changed how I shop. No more plastic bags at the grocery store! I carry my tote everywhere, and so many people have asked about it. I love explaining how it supports the ocean cleanup initiative. The QR code on the bag has even led three of my friends to claim their own bags.',
    excerpt: 'I claimed my first Changebag tote bag six months ago, and it changed how I shop. No more plastic bags at the grocery store!...',
    createdAt: new Date('2025-05-02'),
  },
  {
    id: 'claim-2',
    title: 'How a tote bag connected me to my community',
    authorName: 'Priya Patel',
    imageUrl: '/stories/story1.png',
    content: 'When I claimed my tote bag for the local food bank initiative, I didn\'t expect it to lead to volunteering opportunities. But carrying the bag around town sparked conversations with neighbors who were also supporting the same cause. Now I volunteer weekly at the food bank and have made amazing friends in my community.',
    excerpt: 'When I claimed my tote bag for the local food bank initiative, I didn\'t expect it to lead to volunteering opportunities...',
    createdAt: new Date('2025-04-28'),
  },
  {
    id: 'claim-3',
    title: 'Teaching my kids about sustainability',
    authorName: 'Lisa Chang',
    imageUrl: '/images/teaching.png',
    content: 'My children love our Changebag tote bags! They ask questions about the causes we support, and it\'s been a great way to teach them about environmental responsibility. We\'ve claimed bags for animal welfare and education initiatives, and the kids are proud to carry them to school. It\'s amazing how a simple bag can spark such important conversations.',
    excerpt: 'My children love our Changebag tote bags! They ask questions about the causes we support, and it\'s been a great way to teach them...',
    createdAt: new Date('2025-05-05'),
  },
//   {
//     id: 'claim-4',
//     title: 'From single-use to sustainable living',
//     authorName: 'Alex Johnson',
//     imageUrl: '/stories/story2.png',
//     content: 'Claiming my first tote bag was the start of a complete lifestyle change. I\'ve since claimed bags for different causes and have eliminated almost all single-use plastics from my life. The quality of these bags is incredible - they\'ve lasted over a year of daily use. I\'ve even started a small group in my neighborhood to share tips on sustainable living.',
//     excerpt: 'Claiming my first tote bag was the start of a complete lifestyle change. I\'ve since claimed bags for different causes...',
//     createdAt: new Date('2025-05-12'),
//   },
//   {
//     id: 'claim-5',
//     title: 'Supporting causes I care about',
//     authorName: 'Rachel Green',
//     imageUrl: '/stories/story1.png',
//     content: 'I love that I can support multiple causes through Changebag. I\'ve claimed bags for environmental protection, animal welfare, and education initiatives. Each bag tells a story and helps me feel connected to the causes I care about. The fact that they\'re free and high-quality makes it even better!',
//     excerpt: 'I love that I can support multiple causes through Changebag. I\'ve claimed bags for environmental protection...',
//     createdAt: new Date('2025-05-18'),
//   },
//   {
//     id: 'claim-6',
//     title: 'Building a sustainable future, one bag at a time',
//     authorName: 'Carlos Martinez',
//     imageUrl: '/stories/story3.png',
//     content: 'As a college student, I appreciate that Changebag makes supporting good causes accessible. I\'ve claimed bags for various initiatives and use them for everything from groceries to carrying books. My friends have been inspired to claim their own bags, and we\'ve started a campus sustainability group. It\'s amazing how one small action can create such positive change.',
//     excerpt: 'As a college student, I appreciate that Changebag makes supporting good causes accessible. I\'ve claimed bags for various initiatives...',
//     createdAt: new Date('2025-05-22'),
//   }
];

// Legacy export for backward compatibility (if needed)
export const mockStories: Story[] = [...sponsorStories, ...claimStories]; 