import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Input, Textarea, VStack, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { BASE_URL } from "../constant";

type SeriesFormProps = 
{
    isOpen:boolean;
    onClose:()=>void;
    fetchSeries:()=>void;
}


const seriesForm = ({isOpen, onClose, fetchSeries}:SeriesFormProps) => {

  const toast = useToast();
  const [series, setSeries] = useState({
    title:'',
    genre:'',
    releaseYear:0,
    finalYear:0,
    description: ''
  })

  const onSave = ()=>{   
    axios.post(BASE_URL+"series",series).then((res)=>{
      console.log(res);
      fetchSeries();

      toast({
        title:'Series added',
        description:'series added succedfully',
        isClosable:true,
        duration:100
      })

    }).catch((err)=>{
      console.log(err);
    })
  }
        
        return (
          <>
            
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader shadow={'sm'} >Add Series</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack gap={4}>
                    <Input type="text" placeholder="title" value={series.title} onChange={(s) => setSeries({...series,title:s.target.value})}/>
                    <Input type="text" placeholder="genre" value={series.genre} onChange={(s) => setSeries({...series,genre:s.target.value})}/>
                    <Input type="number" placeholder="release year"  value={series.releaseYear || ''} onChange={(s) => setSeries({...series, releaseYear: s.target.value ? parseInt(s.target.value) : 0 })}/>
                    <Input type="number" placeholder="final year" value={series.finalYear || ''} onChange={(s) => setSeries({...series, finalYear: s.target.value ? parseInt(s.target.value) : 0 })}/>
                    <Textarea placeholder="Description" value={series.description} onChange={(s) => setSeries({...series,description:s.target.value})}/>
                  </VStack>
                </ModalBody>
      
                <ModalFooter>
                  <Button  colorScheme='black'  variant='ghost' mr={3} onClick={onClose}>
                    Close
                  </Button>
                  <Button onClick={onSave} colorScheme='blue' >Save</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        );
}

export default seriesForm