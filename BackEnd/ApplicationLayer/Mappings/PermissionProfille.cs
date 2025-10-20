using Application.DTOs.ManageStaffDtos;
using AutoMapper;
using Domain.Entities;

namespace Application.Mappings;

public class PermissionProfille : Profile
{
    public PermissionProfille()
    {
        CreateMap<Permission, PermissionDto>();
    }
}