using Application.DTOs;
using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Moq;


namespace Application.Tests.Services
{
    public class ComplaintServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly ComplaintService _service;

        public ComplaintServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _service = new ComplaintService(_mockUow.Object);
        }

        [Fact]
        public async Task AddNewComplaint_ShouldThrow_WhenDtoIsNull()
        {
            await Assert.ThrowsAsync<ArgumentNullException>(() =>
                _service.AddNewComplaint(null, 1));
        }

        [Fact]
        public async Task AddNewComplaint_ShouldThrow_WhenReasonIsEmpty()
        {
            var dto = new CreateComplaintDto { Reason = "" };

            await Assert.ThrowsAsync<ArgumentException>(() =>
                _service.AddNewComplaint(dto, 1));
        }

        [Fact]
        public async Task AddNewComplaint_ShouldThrow_WhenUserIdInvalid()
        {
            var dto = new CreateComplaintDto { Reason = "Valid reason" };

            await Assert.ThrowsAsync<ArgumentException>(() =>
                _service.AddNewComplaint(dto, 0));
        }

        [Fact]
        public async Task AddNewComplaint_ShouldReturnComplaint_WhenValid()
        {
            var dto = new CreateComplaintDto { Reason = "Valid" };
            var complaint = new Complaint();

            _mockUow.Setup(u => u.Complaints.AddNewComplaint(dto, 1))
                    .ReturnsAsync(complaint);

            var result = await _service.AddNewComplaint(dto, 1);

            Assert.NotNull(result);
        }
        

        [Fact]
        public async Task GetComplaintById_ShouldThrow_WhenNotFound()
        {
            _mockUow.Setup(u => u.Complaints.GetComplaintById(1))
                    .ReturnsAsync((Complaint)null);

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.GetComplaintById(1));
        }

        [Fact]
        public async Task GetComplaintById_ShouldReturnComplaint_WhenFound()
        {
            _mockUow.Setup(u => u.Complaints.GetComplaintById(1))
                    .ReturnsAsync(new Complaint());

            var result = await _service.GetComplaintById(1);

            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetComplaintsByStatus_ShouldThrow_WhenEmpty()
        {
            _mockUow.Setup(u => u.Complaints.GetComplaintsByStatus("open"))
                    .ReturnsAsync(new List<Complaint>());

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.GetComplaintsByStatus("open"));
        }

        [Fact]
        public async Task GetComplaintsByStatus_ShouldReturnList_WhenFound()
        {
            _mockUow.Setup(u => u.Complaints.GetComplaintsByStatus("open"))
                    .ReturnsAsync(new List<Complaint> { new Complaint() });

            var result = await _service.GetComplaintsByStatus("open");

            Assert.Single(result);
        }



        [Fact]
        public async Task GetComplaintsByLevel_ShouldThrow_WhenEmpty()
        {
            _mockUow.Setup(u => u.Complaints.GetComplaintsByLevel("high"))
                    .ReturnsAsync(new List<Complaint>());

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.GetComplaintsByLevel("high"));
        }

        [Fact]
        public async Task GetComplaintsByLevel_ShouldReturnList_WhenFound()
        {
            _mockUow.Setup(u => u.Complaints.GetComplaintsByLevel("high"))
                    .ReturnsAsync(new List<Complaint> { new Complaint() });

            var result = await _service.GetComplaintsByLevel("high");

            Assert.Single(result);
        }


        [Fact]
        public async Task GetComplaintsByAssignee_ShouldThrow_WhenEmpty()
        {
            _mockUow.Setup(u => u.Complaints.GetComplaintsByAssignee(10))
                    .ReturnsAsync(new List<Complaint>());

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.GetComplaintsByAssignee(10));
        }

        [Fact]
        public async Task GetComplaintsByAssignee_ShouldReturnList_WhenFound()
        {
            _mockUow.Setup(u => u.Complaints.GetComplaintsByAssignee(10))
                    .ReturnsAsync(new List<Complaint> { new Complaint() });

            var result = await _service.GetComplaintsByAssignee(10);

            Assert.Single(result);
        }




        [Fact]
        public async Task GetComplaintsByUser_ShouldThrow_WhenEmpty()
        {
            _mockUow.Setup(u => u.Complaints.GetComplaintsByUserId(55))
                    .ReturnsAsync(new List<Complaint>());

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.GetComplaintsByUser(55));
        }

        [Fact]
        public async Task GetComplaintsByUser_ShouldReturnList_WhenFound()
        {
            _mockUow.Setup(u => u.Complaints.GetComplaintsByUserId(55))
                    .ReturnsAsync(new List<Complaint> { new Complaint() });

            var result = await _service.GetComplaintsByUser(55);

            Assert.Single(result);
        }



        [Fact]
        public async Task UpdateStatusComplaint_ShouldThrow_WhenIdInvalid()
        {
            await Assert.ThrowsAsync<ArgumentException>(() =>
                _service.UpdateStatusComplaint(0, "open", 1));
        }

        [Fact]
        public async Task UpdateStatusComplaint_ShouldThrow_WhenStatusEmpty()
        {
            await Assert.ThrowsAsync<ArgumentException>(() =>
                _service.UpdateStatusComplaint(1, "", 1));
        }

        [Fact]
        public async Task UpdateStatusComplaint_ShouldThrow_WhenNotUpdated()
        {
            _mockUow.Setup(u => u.Complaints.UpdateStatusComplaint(1, "open", 1))
                    .ReturnsAsync(false);

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.UpdateStatusComplaint(1, "open", 1));
        }


        [Fact]
        public async Task UpdateLevelComplaint_ShouldThrow_WhenLevelEmpty()
        {
            await Assert.ThrowsAsync<ArgumentException>(() =>
                _service.UpdateLevelComplaint(1, "", 1));
        }

        [Fact]
        public async Task UpdateLevelComplaint_ShouldThrow_WhenNotUpdated()
        {
            _mockUow.Setup(u => u.Complaints.UpdateLevelComplaint(1, "high", 1))
                    .ReturnsAsync(false);

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.UpdateLevelComplaint(1, "high", 1));
        }



        [Fact]
        public async Task DeleteComplaint_ShouldThrow_WhenNotDeleted()
        {
            _mockUow.Setup(u => u.Complaints.DeleteComplaint(1, 1))
                    .ReturnsAsync(false);

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.DeleteComplaint(1, 1));
        }
    }
}
