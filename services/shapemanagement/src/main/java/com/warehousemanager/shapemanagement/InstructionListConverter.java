package com.warehousemanager.shapemanagement;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.List;

@Converter
public class InstructionListConverter implements AttributeConverter<List<Instruction>, String> {
  private static final ObjectMapper objectMapper =
      new ObjectMapper().registerModule(new JavaTimeModule());

  @Override
  public String convertToDatabaseColumn(List<Instruction> instructions) {
    if (instructions == null || instructions.isEmpty()) {
      return null;
    }
    try {
      return objectMapper.writeValueAsString(instructions);
    } catch (JsonProcessingException e) {
      throw new RuntimeException("Error converting instruction list to JSON", e);
    }
  }

  @Override
  public List<Instruction> convertToEntityAttribute(String dbJson) {
    try {
      return objectMapper.readValue(
          dbJson,
          objectMapper.getTypeFactory().constructCollectionType(List.class, Instruction.class));
    } catch (JsonProcessingException e) {
      throw new RuntimeException("Error converting JSON to instruction list", e);
    }
  }
}
