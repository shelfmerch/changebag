
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Story {
  name: string;
  role: string;
  quote: string;
  image: string;
}

interface StoriesCarouselProps {
  stories: Story[];
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.2, duration: 0.6 } }
};

const StoriesCarousel = ({ stories }: StoriesCarouselProps) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold text-center mb-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
          }}
        >
          Stories of Impact
        </motion.h2>
        <motion.p 
          className="text-center text-gray-600 mb-10 max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          Meet the people whose lives have been changed by this initiative
        </motion.p>
        
        <Carousel 
          opts={{ loop: true, align: 'start' }}
          className="w-full max-w-4xl mx-auto"
          setApi={(api) => {
            // Auto-advance every 5 seconds
            let interval: NodeJS.Timeout | undefined;
            if (api) {
              interval = setInterval(() => {
                api.scrollNext();
              }, 5000);
            }
            return () => clearInterval(interval);
          }}
        >
          <CarouselContent>
            {stories.map((story, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <Avatar className="w-20 h-20 mb-4">
                      <AvatarImage src={story.image} alt={story.name} />
                      <AvatarFallback>{story.name[0]}</AvatarFallback>
                    </Avatar>
                    <blockquote className="italic mb-4">"{story.quote}"</blockquote>
                    <div>
                      <p className="font-semibold">{story.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{story.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-4">
            <CarouselPrevious className="relative static mr-2" />
            <CarouselNext className="relative static" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default StoriesCarousel;
