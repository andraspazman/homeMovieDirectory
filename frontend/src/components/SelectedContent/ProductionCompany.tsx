// src/components/ProductionCompany/ProductionCompany.tsx
import React from "react";
import { Box, Text, Button, HStack } from "@chakra-ui/react";
import { ProductionCompanyProps } from "../../interfaces/IProductionCompanyProps";



const ProductionCompany: React.FC<ProductionCompanyProps> = ({
  name,
  website,
  isLoggedIn,
  onEdit,
  onAdd,
}) => {
  return (
    <Box>
        <Text><strong>Production Company:</strong> {name ? name : "n/a"}</Text>
        <Text><strong>Website:</strong> {website ? website : "n/a"}</Text>
      {isLoggedIn && (
        <HStack spacing={2} mt={2}>
          {onEdit && (<Button size="xs" colorScheme="yellow" onClick={onEdit}>Edit Company</Button>)}
          {onAdd && (<Button size="xs" colorScheme="green" onClick={onAdd}>Add Company</Button>)}
        </HStack>
      )}
    </Box>
  );
};

export default ProductionCompany;
