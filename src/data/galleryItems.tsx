interface GalleryItem {
    id: number;
    src: string;
    alt: string;
    title: string;
    description: string;
}

export const galleryItems: GalleryItem[] = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=800',
      alt: 'Two women reading together',
      title: 'Educational Partnership',
      description: 'Supporting literacy programs worldwide'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=700',
      alt: 'Children in classroom',
      title: 'Classroom Support',
      description: 'Building better learning environments'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=900',
      alt: 'Diverse community gathering',
      title: 'Community Building',
      description: 'Connecting communities globally'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=750',
      alt: 'Mother and child reading',
      title: 'Family Support',
      description: 'Strengthening family bonds through education'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=800',
      alt: 'Children playing outdoors',
      title: 'Active Learning',
      description: 'Promoting healthy development'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=900',
      alt: 'Teacher helping students',
      title: 'Teacher Training',
      description: 'Empowering educators globally'
    }
  ];